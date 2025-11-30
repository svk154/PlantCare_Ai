import os
from app.utils.language import translate_dict, translate_text
from flask import g

def translate_disease_info(disease_info, language='English'):
    """
    Translate disease information based on the language
    """
    if language == 'English':
        return disease_info
    
    # Create translation dictionary for Hindi
    hindi_disease_translations = {
        # Disease classes with Hindi translations
        "Apple___Apple_scab": "सेब___सेब स्कैब",
        "Apple___Black_rot": "सेब___काला सड़न",
        "Apple___Cedar_apple_rust": "सेब___सीडर सेब जंग",
        "Apple___healthy": "सेब___स्वस्थ",
        "Blueberry___healthy": "ब्लूबेरी___स्वस्थ",
        "Cherry_(including_sour)___Powdery_mildew": "चेरी_(खट्टी सहित)___पाउडरी मिल्ड्यू",
        "Cherry_(including_sour)___healthy": "चेरी_(खट्टी सहित)___स्वस्थ",
        "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "मक्का___सर्कोस्पोरा लीफ स्पॉट ग्रे लीफ स्पॉट",
        "Corn_(maize)___Common_rust_": "मक्का___सामान्य जंग",
        "Corn_(maize)___Northern_Leaf_Blight": "मक्का___उत्तरी पत्ती झुलसा",
        "Corn_(maize)___healthy": "मक्का___स्वस्थ",
        "Grape___Black_rot": "अंगूर___काला सड़न",
        "Grape___Esca_(Black_Measles)": "अंगूर___एस्का_(काला खसरा)",
        "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "अंगूर___पत्ती झुलसा_(आइसारिओप्सिस पत्ती धब्बा)",
        "Grape___healthy": "अंगूर___स्वस्थ",
        "Orange___Haunglongbing_(Citrus_greening)": "संतरा___हौंगलॉन्गबिंग_(सिट्रस ग्रीनिंग)",
        "Peach___Bacterial_spot": "आड़ू___बैक्टीरियल स्पॉट",
        "Peach___healthy": "आड़ू___स्वस्थ",
        "Pepper,_bell___Bacterial_spot": "शिमला मिर्च___बैक्टीरियल स्पॉट",
        "Pepper,_bell___healthy": "शिमला मिर्च___स्वस्थ",
        "Potato___Early_blight": "आलू___प्रारंभिक झुलसा",
        "Potato___Late_blight": "आलू___पछेती झुलसा",
        "Potato___healthy": "आलू___स्वस्थ",
        "Raspberry___healthy": "रास्पबेरी___स्वस्थ",
        "Soybean___healthy": "सोयाबीन___स्वस्थ",
        "Squash___Powdery_mildew": "स्क्वैश___पाउडरी मिल्ड्यू",
        "Strawberry___Leaf_scorch": "स्ट्रॉबेरी___पत्ती झुलसा",
        "Strawberry___healthy": "स्ट्रॉबेरी___स्वस्थ",
        "Tomato___Bacterial_spot": "टमाटर___बैक्टीरियल स्पॉट",
        "Tomato___Early_blight": "टमाटर___प्रारंभिक झुलसा",
        "Tomato___Late_blight": "टमाटर___पछेती झुलसा",
        "Tomato___Leaf_Mold": "टमाटर___पत्ती मोल्ड",
        "Tomato___Septoria_leaf_spot": "टमाटर___सेप्टोरिया पत्ती धब्बा",
        "Tomato___Spider_mites Two-spotted_spider_mite": "टमाटर___स्पाइडर माइट्स दो-धब्बेदार स्पाइडर माइट",
        "Tomato___Target_Spot": "टमाटर___टारगेट स्पॉट",
        "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "टमाटर___टमाटर पीला पत्ती कर्ल वायरस",
        "Tomato___Tomato_mosaic_virus": "टमाटर___टमाटर मोज़ेक वायरस",
        "Tomato___healthy": "टमाटर___स्वस्थ",
        
        # Common disease-related terms
        "disease": "रोग",
        "healthy": "स्वस्थ",
        "symptoms": "लक्षण",
        "treatment": "उपचार",
        "prevention": "रोकथाम",
        "fungicide": "फफूंदीनाशक",
        "pesticide": "कीटनाशक",
        "organic": "जैविक",
        "chemical": "रासायनिक",
        "apply": "लागू करें",
        "spray": "छिड़काव करें",
        "remove": "हटाएं",
        "infected": "संक्रमित",
        "leaves": "पत्तियां",
        "spots": "धब्बे",
        "rust": "जंग",
        "mold": "फफूंदी",
        "rot": "सड़न",
        "virus": "वायरस",
        "bacteria": "बैक्टीरिया",
        "fungus": "फफूंद",
    }
    
    # Helper function to translate disease text
    def translate_disease_text(text):
        # First check if there's an exact match in our dictionary
        if text in hindi_disease_translations:
            return hindi_disease_translations[text]
        
        # Otherwise use the general translation function
        return translate_text(text, language)
    
    # If high confidence result exists
    if disease_info.get('isConfident') and 'highConfidenceResult' in disease_info:
        high_conf = disease_info['highConfidenceResult']
        
        # Translate disease name
        if 'diseaseName' in high_conf:
            high_conf['diseaseName'] = translate_disease_text(high_conf['diseaseName'])
        
        # Translate description
        if 'description' in high_conf:
            high_conf['description'] = translate_disease_text(high_conf['description'])
        
        # Translate cause
        if 'cause' in high_conf:
            high_conf['cause'] = translate_disease_text(high_conf['cause'])
        
        # Translate symptoms (list of strings)
        if 'symptoms' in high_conf:
            high_conf['symptoms'] = [translate_disease_text(s) for s in high_conf['symptoms']]
        
        # Translate organic treatments (list of objects)
        if 'organicTreatments' in high_conf:
            for treatment in high_conf['organicTreatments']:
                if 'title' in treatment:
                    treatment['title'] = translate_disease_text(treatment['title'])
                if 'description' in treatment:
                    treatment['description'] = translate_disease_text(treatment['description'])
        
        # Translate chemical treatments (list of objects)
        if 'chemicalTreatments' in high_conf:
            for treatment in high_conf['chemicalTreatments']:
                if 'activeIngredient' in treatment:
                    treatment['activeIngredient'] = translate_disease_text(treatment['activeIngredient'])
                if 'usage' in treatment:
                    treatment['usage'] = translate_disease_text(treatment['usage'])
                if 'caution' in treatment:
                    treatment['caution'] = translate_disease_text(treatment['caution'])
        
        # Translate prevention tips (list of strings)
        if 'prevention' in high_conf:
            high_conf['prevention'] = [translate_disease_text(p) for p in high_conf['prevention']]
    
    # If low confidence results exist
    if 'lowConfidenceResults' in disease_info:
        for result in disease_info['lowConfidenceResults']:
            if 'diseaseName' in result:
                result['diseaseName'] = translate_disease_text(result['diseaseName'])
            if 'preventionTips' in result:
                result['preventionTips'] = translate_disease_text(result['preventionTips'])
    
    return disease_info

def get_gemini_prompt(language='English'):
    """
    Return the appropriate Gemini prompt based on language
    """
    english_prompt = """
You are an expert agricultural pathologist specializing in plant disease identification. Your task is to analyze this plant image with EXTREME PRECISION.

🔍 IMPORTANT: You have access to web search capabilities. Please search the web for current information to enhance your analysis accuracy.

CRITICAL IDENTIFICATION STEPS WITH WEB SEARCH:

1. FIRST: Search the web to identify the PLANT TYPE accurately:
   - Search: "plant identification by leaf shape [describe what you see in image]"
   - Search: "[suspected plant type] leaf morphology botanical characteristics"  
   - Search: "citrus vs tomato vs apple leaf differences botanical identification"
   - Search: "plant identification guide [leaf shape] [leaf arrangement] [plant structure]"
   - Cross-reference with botanical databases and expert plant identification resources

2. SECOND: Search for disease symptoms and current information:
   - Search: "[identified plant type] common diseases symptoms [describe visible symptoms]"
   - Search: "[plant type] plant pathology leaf spots discoloration patterns"
   - Search: "current [plant type] disease outbreaks identification guides 2025"
   - Search: "agricultural extension [plant type] disease diagnosis [symptom description]"
   - Verify symptoms against multiple botanical and agricultural sources

3. THIRD: Verify disease classification with web resources:
   - Search: "[suspected disease name] symptoms identification comparison photos"
   - Search: "plant pathology database [plant type] [disease symptoms]"
   - Search: "agricultural disease identification [plant type] expert diagnosis"
   - Cross-check with university extension services and plant pathology databases

Available disease classes (choose ONLY from this list; plant type MUST match image):
{disease_classes}

🌐 WEB SEARCH MANDATE:
- ALWAYS search the web before making your final diagnosis
- Use multiple search queries to verify plant type and disease identification
- Reference current botanical databases, agricultural extension sites, and plant pathology resources
- Include web search insights in your analysis reasoning
- Search for recent disease identification guides and expert resources
- Verify your findings against multiple reliable agricultural and botanical sources

🇮🇳 INDIAN FARMERS SUPPORT - CRITICAL REQUIREMENT:
- **ABSOLUTELY MANDATORY**: You MUST include "indianBuyingLinks" field in your JSON response
- **REQUIRED**: Search for buying links and resources specifically for farmers in India
- Search: "buy [treatment product] online India farmers agricultural supplies"
- Search: "Indian agricultural e-commerce [fungicide/pesticide] delivery"  
- Search: "agricultural input dealers India online [specific products]"
- Search: "BigHaat, AgroStar, KisanKraft, Bighaat.com agricultural products India"
- **MUST INCLUDE**: Exactly 3 verified Indian websites/platforms in "indianBuyingLinks" array
- Focus on: BigHaat, AgroStar, Kisan Kraft, DeHaat, agricultural e-commerce platforms
- **FAILURE TO INCLUDE BUYING LINKS WILL MAKE RESPONSE INCOMPLETE**

ACCURACY REQUIREMENTS:
- Web search MUST confirm plant type before disease classification
- If web search confirms citrus/orange plant → ONLY choose Orange___ diseases
- If web search confirms tomato plant → ONLY choose Tomato___ diseases
- If web search confirms apple plant → ONLY choose Apple___ diseases
- DO NOT misclassify plant types based on similar symptoms
- If plant type doesn't match available disease classes, state "Unknown" with explanation
- Always include reasoning based on web search verification

Provide your analysis in the following STRICT JSON format (no markdown fences, no trailing commas):
{{
    "isConfident": true | false,
    "highConfidenceResult": {{
        "diseaseName": "Exact disease class string from the list (or healthy class)",
        "description": "1-2 sentence plain-language summary of the disease (what it is)",
        "cause": "1 concise sentence explaining WHY it occurs (pathogen + favorable conditions; e.g. 'Caused by the fungus Venturia inaequalis favored by cool, wet spring weather')",
        "confidenceScore": 0-100,
        "symptoms": ["Distinct visible symptom 1", "Symptom 2", "Symptom 3"],
        "organicTreatments": [
            {{"title": "Short organic method name", "description": "Action + how/when to apply"}},
            {{"title": "Another organic method", "description": "Action + how/when to apply"}}
        ],
        "chemicalTreatments": [
            {{"activeIngredient": "Common name of AI (e.g. copper hydroxide)", "usage": "When & interval", "caution": "Safety or resistance note"}},
            {{"activeIngredient": "Second AI", "usage": "When & interval", "caution": "Safety or resistance note"}}
        ],
        "prevention": ["Preventive practice 1", "Practice 2", "Practice 3"],
        "indianBuyingLinks": [
            {{"category": "Organic Products", "website": "Website name", "url": "https://website.com", "description": "Brief description of products available"}},
            {{"category": "Chemical Fungicides", "website": "Website name", "url": "https://website.com", "description": "Brief description of products available"}},
            {{"category": "Agricultural Supplies", "website": "Website name", "url": "https://website.com", "description": "Brief description of products available"}}
        ]
    }},
    "lowConfidenceResults": [
        {{"diseaseName": "Possible disease class from list", "preventionTips": "Very short prevention tip"}},
        {{"diseaseName": "Second possibility", "preventionTips": "Very short prevention tip"}},
        {{"diseaseName": "Third possibility", "preventionTips": "Very short prevention tip"}}
    ]
}}

Rules:
- If confidence >= 70: isConfident=true and INCLUDE highConfidenceResult, set lowConfidenceResults to [] or omit.
- If confidence < 70: isConfident=false and INCLUDE 2-3 lowConfidenceResults; omit highConfidenceResult or set it to null.
- EXACTLY 2 objects in organicTreatments and in chemicalTreatments when confident.
- **CRITICAL**: ALWAYS include "indianBuyingLinks" array with exactly 3 objects - this is MANDATORY.
- DO NOT invent a disease not in the list.
- Use plain text only (no markdown) and valid JSON only.
- Keep each description field concise (avoid newlines inside strings).
- **INCOMPLETE RESPONSE WITHOUT "indianBuyingLinks" FIELD IS UNACCEPTABLE**.
Respond ONLY with JSON.
"""

    hindi_prompt = """
आप एक विशेषज्ञ पादप रोगविज्ञानी हैं। इस पौधे की छवि का अत्यधिक सटीकता के साथ विश्लेषण करें।

🔍 महत्वपूर्ण: आपके पास वेब खोज क्षमताएं हैं। कृपया अपने विश्लेषण की सटीकता बढ़ाने के लिए वर्तमान जानकारी के लिए वेब खोजें।

वेब खोज के साथ महत्वपूर्ण पहचान चरण:

1. पहले: पौधे के प्रकार की सटीक पहचान के लिए वेब खोज करें:
   - खोजें: "plant identification by leaf shape [छवि में दिखाई देने वाली विशेषताएं वर्णित करें]"
   - खोजें: "[संदिग्ध पौधे का प्रकार] पत्ती आकारिकी वनस्पति विशेषताएं"
   - खोजें: "citrus vs tomato vs apple leaf differences botanical identification"
   - खोजें: "plant identification guide [पत्ती का आकार] [पत्ती की व्यवस्था]"

2. दूसरे: रोग के लक्षणों और वर्तमान जानकारी के लिए खोज करें:
   - खोजें: "[पहचाने गए पौधे का प्रकार] common diseases symptoms [दिखाई देने वाले लक्षण]"
   - खोजें: "[पौधे का प्रकार] plant pathology leaf spots discoloration patterns"
   - खोजें: "current [पौधे का प्रकार] disease outbreaks identification 2025"
   - खोजें: "agricultural extension [पौधे का प्रकार] disease diagnosis"

3. तीसरे: वेब संसाधनों के साथ रोग वर्गीकरण की पुष्टि करें:
   - खोजें: "[संदिग्ध रोग नाम] symptoms identification comparison photos"
   - खोजें: "plant pathology database [पौधे का प्रकार] [रोग के लक्षण]"
   - खोजें: "agricultural disease identification [पौधे का प्रकार] expert diagnosis"

उपलब्ध रोग वर्ग (केवल इस सूची से चुनें; पौधे का प्रकार छवि से मेल खाना चाहिए):
{disease_classes}

🌐 वेब खोज आदेश:
- अंतिम निदान करने से पहले हमेशा वेब खोज करें
- पौधे के प्रकार और रोग पहचान को सत्यापित करने के लिए कई खोज क्वेरी का उपयोग करें
- वर्तमान वनस्पति डेटाबेस, कृषि विस्तार साइटों और पौधे रोगविज्ञान संसाधनों का संदर्भ लें
- अपने विश्लेषण तर्क में वेब खोज अंतर्दृष्टि शामिल करें
- हाल की रोग पहचान गाइड और विशेषज्ञ संसाधनों की खोज करें

🇮🇳 भारतीय किसान सहायता - महत्वपूर्ण आवश्यकता:
- **बिल्कुल अनिवार्य**: आपको अपने JSON उत्तर में "indianBuyingLinks" फील्ड शामिल करना चाहिए
- **आवश्यक**: विशेष रूप से भारत में किसानों के लिए खरीदारी लिंक और संसाधनों की खोज करें
- खोजें: "buy [उपचार उत्पाद] online India farmers कृषि आपूर्ति"
- खोजें: "Indian agricultural e-commerce [फफूंदीनाशक/कीटनाशक] delivery"
- खोजें: "agricultural input dealers India online [विशिष्ट उत्पाद]"
- खोजें: "BigHaat, AgroStar, KisanKraft, Bighaat.com agricultural products India"
- **शामिल करना चाहिए**: "indianBuyingLinks" array में बिल्कुल 3 सत्यापित भारतीय वेबसाइट/प्लेटफॉर्म
- फोकस: BigHaat, AgroStar, Kisan Kraft, DeHaat, कृषि ई-कॉमर्स प्लेटफॉर्म
- **खरीदारी लिंक शामिल करने में विफलता से उत्तर अधूरा हो जाएगा**

सटीकता आवश्यकताएं:
- रोग वर्गीकरण से पहले वेब खोज को पौधे के प्रकार की पुष्टि करनी चाहिए
- यदि वेब खोज नारंगी/संतरे के पौधे की पुष्टि करती है → केवल Orange___ रोग चुनें
- यदि वेब खोज टमाटर के पौधे की पुष्टि करती है → केवल Tomato___ रोग चुनें
- यदि वेब खोज सेब के पौधे की पुष्टि करती है → केवल Apple___ रोग चुनें
- समान लक्षणों के आधार पर पौधे के प्रकार को गलत वर्गीकृत न करें
- हमेशा वेब खोज सत्यापन के आधार पर तर्क शामिल करें

अपना विश्लेषण निम्नलिखित सख्त JSON प्रारूप में प्रदान करें (कोई मार्कडाउन बाड़ नहीं, कोई अनावश्यक कॉमा नहीं):
{{
    "isConfident": true | false,
    "highConfidenceResult": {{
        "diseaseName": "सूची से सटीक रोग वर्ग स्ट्रिंग (या स्वस्थ वर्ग)",
        "description": "रोग का 1-2 वाक्य सरल भाषा में सारांश (यह क्या है)",
        "cause": "यह क्यों होता है, इसका 1 संक्षिप्त वाक्य (रोगजनक + अनुकूल परिस्थितियां; जैसे 'ठंडे, गीले वसंत मौसम में अनुकूल फंगस वेंटुरिया इनिक्वैलिस के कारण होता है')",
        "confidenceScore": 0-100,
        "symptoms": ["अलग दिखाई देने वाला लक्षण 1", "लक्षण 2", "लक्षण 3"],
        "organicTreatments": [
            {{"title": "संक्षिप्त जैविक विधि का नाम", "description": "कार्रवाई + कैसे/कब लागू करें"}},
            {{"title": "एक और जैविक विधि", "description": "कार्रवाई + कैसे/कब लागू करें"}}
        ],
        "chemicalTreatments": [
            {{"activeIngredient": "AI का सामान्य नाम (जैसे कॉपर हाइड्रॉक्साइड)", "usage": "कब और अंतराल", "caution": "सुरक्षा या प्रतिरोध नोट"}},
            {{"activeIngredient": "दूसरा AI", "usage": "कब और अंतराल", "caution": "सुरक्षा या प्रतिरोध नोट"}}
        ],
        "prevention": ["निवारक अभ्यास 1", "अभ्यास 2", "अभ्यास 3"],
        "indianBuyingLinks": [
            {{"category": "जैविक उत्पाद", "website": "वेबसाइट नाम", "url": "https://website.com", "description": "उपलब्ध उत्पादों का संक्षिप्त विवरण"}},
            {{"category": "रासायनिक फफूंदीनाशक", "website": "वेबसाइट नाम", "url": "https://website.com", "description": "उपलब्ध उत्पादों का संक्षिप्त विवरण"}},
            {{"category": "कृषि आपूर्ति", "website": "वेबसाइट नाम", "url": "https://website.com", "description": "उपलब्ध उत्पादों का संक्षिप्त विवरण"}}
        ]
    }},
    "lowConfidenceResults": [
        {{"diseaseName": "सूची से संभावित रोग वर्ग", "preventionTips": "बहुत छोटा रोकथाम टिप"}},
        {{"diseaseName": "दूसरी संभावना", "preventionTips": "बहुत छोटा रोकथाम टिप"}},
        {{"diseaseName": "तीसरी संभावना", "preventionTips": "बहुत छोटा रोकथाम टिप"}}
    ]
}}

नियम:
- यदि विश्वास >= 70: isConfident=true और highConfidenceResult शामिल करें, lowConfidenceResults को [] सेट करें या छोड़ दें।
- यदि विश्वास < 70: isConfident=false और 2-3 lowConfidenceResults शामिल करें; highConfidenceResult को छोड़ें या null पर सेट करें।
- जब विश्वस्त हों तब organicTreatments और chemicalTreatments में ठीक 2 वस्तुएँ।
- **महत्वपूर्ण**: हमेशा "indianBuyingLinks" सरणी को बिल्कुल 3 वस्तुओं के साथ शामिल करें - यह अनिवार्य है।
- सूची में नहीं दिए गए रोग का आविष्कार न करें।
- केवल सादा पाठ (कोई मार्कडाउन नहीं) और केवल वैध JSON का उपयोग करें।
- प्रत्येक विवरण फ़ील्ड को संक्षिप्त रखें (स्ट्रिंग्स के भीतर नई लाइन से बचें)।
- **"indianBuyingLinks" फील्ड के बिना अधूरा उत्तर अस्वीकार्य है**।
केवल JSON के साथ जवाब दें।
"""

    if language == 'Hindi':
        return hindi_prompt
    return english_prompt