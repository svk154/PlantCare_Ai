# app/models/disease_scan.py
from app import db
from datetime import datetime
import json

class DiseaseScan(db.Model):
    __tablename__ = 'disease_scans'
    
    # Add indexes for faster queries
    __table_args__ = (
        db.Index('idx_user_id_timestamp', 'user_id', 'scan_timestamp'),
        db.Index('idx_user_id_status', 'user_id', 'status'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    image_data = db.Column(db.LargeBinary, nullable=True)  # BLOB to store image directly
    image_path = db.Column(db.String(255), nullable=True)  # Path as fallback
    image_filename = db.Column(db.String(100), nullable=False)  # Original filename
    image_mimetype = db.Column(db.String(50), nullable=True)  # Image MIME type
    
    # Diagnosis results
    is_confident = db.Column(db.Boolean, default=False)
    confidence_threshold = db.Column(db.Float, default=0.8)
    
    # High confidence result (if any)
    disease_name = db.Column(db.String(100))  # Main disease identified
    confidence_score = db.Column(db.Float)  # Confidence percentage
    description = db.Column(db.Text)  # Disease description
    treatment = db.Column(db.Text)  # Treatment recommendations
    
    # Low confidence results (JSON format)
    possible_diseases = db.Column(db.Text)  # JSON string of possible diseases
    
    # Additional metadata
    plant_type = db.Column(db.String(50))  # Type of plant scanned
    scan_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    processing_time = db.Column(db.Float)  # Time taken to process in seconds
    model_version = db.Column(db.String(20), default='v1.0')
    
    # Status tracking
    status = db.Column(db.Enum('pending', 'completed', 'failed', name='scan_status'), 
                      default='pending')
    error_message = db.Column(db.Text)  # Error details if scan failed
    
    def to_dict(self):
        """Convert scan record to dictionary format"""
        # Parse possible diseases from JSON
        possible_diseases = []
        symptoms = []
        prevention = []
        treatment = []
        pesticide_products = []
        organic_treatments = []
        chemical_treatments = []
        cause = ""
        
        if self.possible_diseases:
            try:
                possible_diseases_data = json.loads(self.possible_diseases)
                if isinstance(possible_diseases_data, list):
                    possible_diseases = possible_diseases_data
                    # Extract data if available in the first disease entry
                    if len(possible_diseases_data) > 0:
                        first_disease = possible_diseases_data[0]
                        symptoms = first_disease.get('symptoms', [])
                        prevention = first_disease.get('prevention', [])
                        pesticide_products = first_disease.get('pesticide_products', [])
                        organic_treatments = first_disease.get('organic_treatments', [])
                        chemical_treatments = first_disease.get('chemical_treatments', [])
                        cause = first_disease.get('cause', '')
                        
                        # Handle treatment data - can be string or array
                        treatment_data = first_disease.get('treatment')
                        if isinstance(treatment_data, str):
                            # Split string by commas or convert to array
                            treatment = [t.strip() for t in treatment_data.split(',')]
                        elif isinstance(treatment_data, list):
                            treatment = treatment_data
                        
            except (json.JSONDecodeError, TypeError):
                possible_diseases = []
        
        # Convert treatment field to array if it's a string
        if self.treatment and isinstance(self.treatment, str):
            treatment = [t.strip() for t in self.treatment.split(',')]
        
        # Create diagnosis object
        diagnosis = {
            "isConfident": self.is_confident,
            "confidenceThreshold": self.confidence_threshold
        }
        
        if self.is_confident and self.disease_name:
            diagnosis["highConfidenceResult"] = {
                "diseaseName": self.disease_name,
                "confidenceScore": round(self.confidence_score, 1) if self.confidence_score else 0,
                "description": self.description or "No description available",
                "cause": cause,
                "treatment": treatment,
                "symptoms": symptoms,
                "prevention": prevention,
                "pesticideProducts": pesticide_products,
                "organicTreatments": organic_treatments,
                "chemicalTreatments": chemical_treatments
            }
        else:
            diagnosis["lowConfidenceResults"] = possible_diseases
        
        return {
            "id": self.id,
            "image": f"/api/disease-scans/scans/{self.id}/image",  # Endpoint to serve image
            "imageFilename": self.image_filename,
            "timestamp": self.scan_timestamp.strftime("%Y-%m-%d %H:%M:%S") if self.scan_timestamp else None,
            "diagnosis": diagnosis,
            "plantType": self.plant_type,
            "processingTime": self.processing_time,
            "status": self.status,
            "errorMessage": self.error_message
        }
    
    def set_possible_diseases(self, diseases_list):
        """Set possible diseases as JSON string"""
        self.possible_diseases = json.dumps(diseases_list) if diseases_list else None
    
    def get_possible_diseases(self):
        """Get possible diseases as Python list"""
        if self.possible_diseases:
            try:
                return json.loads(self.possible_diseases)
            except (json.JSONDecodeError, TypeError):
                return []
        return []
    
    def is_recent_scan(self, hours=24):
        """Check if scan was performed within specified hours"""
        if not self.scan_timestamp:
            return False
        time_diff = datetime.utcnow() - self.scan_timestamp
        return time_diff.total_seconds() < (hours * 3600)
