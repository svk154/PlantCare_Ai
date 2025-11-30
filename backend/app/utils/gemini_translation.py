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
        
        # Translate symptoms
        if 'symptoms' in high_conf and isinstance(high_conf['symptoms'], list):
            high_conf['symptoms'] = [translate_disease_text(symptom) for symptom in high_conf['symptoms']]
        
        # Translate organic treatments
        if 'organicTreatments' in high_conf and isinstance(high_conf['organicTreatments'], list):
            for treatment in high_conf['organicTreatments']:
                if 'title' in treatment:
                    treatment['title'] = translate_disease_text(treatment['title'])
                if 'description' in treatment:
                    treatment['description'] = translate_disease_text(treatment['description'])
        
        # Translate chemical treatments
        if 'chemicalTreatments' in high_conf and isinstance(high_conf['chemicalTreatments'], list):
            for treatment in high_conf['chemicalTreatments']:
                if 'activeIngredient' in treatment:
                    treatment['activeIngredient'] = translate_disease_text(treatment['activeIngredient'])
                if 'usage' in treatment:
                    treatment['usage'] = translate_disease_text(treatment['usage'])
                if 'caution' in treatment:
                    treatment['caution'] = translate_disease_text(treatment['caution'])
        
        # Translate prevention
        if 'prevention' in high_conf and isinstance(high_conf['prevention'], list):
            high_conf['prevention'] = [translate_disease_text(prev) for prev in high_conf['prevention']]
    
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

CRITICAL IDENTIFICATION STEPS:

1. FIRST: Identify the PLANT TYPE accurately:
   - Examine leaf shape, arrangement, and plant structure carefully
   - Cross-reference with botanical identification guides
   - Verify plant type matches available disease classes

2. SECOND: Analyze disease symptoms:
   - Look for visible symptoms like spots, discoloration, wilting, etc.
   - Compare symptoms against known disease patterns
   - Verify symptoms against agricultural and botanical sources

3. THIRD: Classify the disease:
   - Match symptoms to specific disease classification
   - Cross-check with plant pathology databases
   - Ensure disease classification matches the identified plant type

Available disease classes (choose ONLY from this list; plant type MUST match image):
{disease_classes}

ACCURACY REQUIREMENTS:
- Plant type MUST be confirmed before disease classification
- If citrus/orange plant → ONLY choose Orange___ diseases
- If tomato plant → ONLY choose Tomato___ diseases
- If apple plant → ONLY choose Apple___ diseases
- DO NOT misclassify plant types based on similar symptoms
- If plant type doesn't match available disease classes, state "Unknown" with explanation

PESTICIDE PRODUCT RECOMMENDATIONS FOR INDIAN FARMERS:
When a disease is identified (not healthy plants), provide EXACTLY 3 pesticide/treatment product recommendations:
- Use your web search capability to find REAL, currently available products in India
- Search for products on: BigHaat.com, AgriBegri.com, IndiaMART.com, Amazon.in (agricultural section), Flipkart.com
- Include both chemical AND organic/biological options when possible
- Provide ACTUAL product names (branded products available in India)
- Include REAL purchase URLs from reputable Indian agricultural e-commerce sites
- Verify products are specifically effective for the identified disease
- Provide approximate price ranges in Indian Rupees (₹)

For HEALTHY plants, set pesticideProducts to empty array [].

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
        "pesticideProducts": [
            {{"productName": "Exact branded product name", "type": "Chemical/Organic/Biological", "activeIngredient": "Active ingredient name", "price": "₹XXX - ₹XXX per liter/kg", "purchaseUrl": "https://exact-url-to-product-page", "seller": "Website name (BigHaat/AgriBegri/IndiaMART/Amazon/Flipkart)"}},
            {{"productName": "Second product", "type": "Chemical/Organic/Biological", "activeIngredient": "Active ingredient", "price": "₹XXX - ₹XXX", "purchaseUrl": "https://url", "seller": "Seller"}},
            {{"productName": "Third product", "type": "Chemical/Organic/Biological", "activeIngredient": "Active ingredient", "price": "₹XXX - ₹XXX", "purchaseUrl": "https://url", "seller": "Seller"}}
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
- DO NOT invent a disease not in the list.
- Use plain text only (no markdown) and valid JSON only.
- Keep each description field concise (avoid newlines inside strings).
Respond ONLY with JSON.
"""

    hindi_prompt = """
आप एक विशेषज्ञ पादप रोगविज्ञानी हैं। इस पौधे की छवि का अत्यधिक सटीकता के साथ विश्लेषण करें।

महत्वपूर्ण पहचान चरण:

1. पहले: पौधे के प्रकार की सटीक पहचान करें:
   - पत्ती का आकार, व्यवस्था और पौधे की संरचना को ध्यान से देखें
   - वनस्पति पहचान गाइड के साथ क्रॉस-रेफरेंस करें
   - सत्यापित करें कि पौधे का प्रकार उपलब्ध रोग वर्गों से मेल खाता है

2. दूसरे: रोग के लक्षणों का विश्लेषण करें:
   - धब्बे, मलिनकिरण, मुरझाना आदि जैसे दिखाई देने वाले लक्षणों की तलाश करें
   - ज्ञात रोग पैटर्न के साथ लक्षणों की तुलना करें
   - कृषि और वनस्पति स्रोतों के खिलाफ लक्षणों को सत्यापित करें

3. तीसरे: रोग को वर्गीकृत करें:
   - लक्षणों को विशिष्ट रोग वर्गीकरण से मिलाएं
   - पौधे रोगविज्ञान डेटाबेस के साथ क्रॉस-चेक करें
   - सुनिश्चित करें कि रोग वर्गीकरण पहचाने गए पौधे के प्रकार से मेल खाता है

उपलब्ध रोग वर्ग (केवल इस सूची से चुनें; पौधे का प्रकार छवि से मेल खाना चाहिए):
{disease_classes}

सटीकता आवश्यकताएं:
- रोग वर्गीकरण से पहले पौधे के प्रकार की पुष्टि होनी चाहिए
- यदि नारंगी/संतरे का पौधा है → केवल Orange___ रोग चुनें
- यदि टमाटर का पौधा है → केवल Tomato___ रोग चुनें
- यदि सेब का पौधा है → केवल Apple___ रोग चुनें
- समान लक्षणों के आधार पर पौधे के प्रकार को गलत वर्गीकृत न करें
- यदि पौधे का प्रकार उपलब्ध रोग वर्गों से मेल नहीं खाता, तो स्पष्टीकरण के साथ "Unknown" बताएं

भारतीय किसानों के लिए कीटनाशक उत्पाद सिफारिशें:
जब कोई रोग पहचाना जाता है (स्वस्थ पौधे नहीं), तो ठीक 3 कीटनाशक/उपचार उत्पाद सिफारिशें प्रदान करें:
- भारत में वर्तमान में उपलब्ध वास्तविक उत्पादों को खोजने के लिए अपनी वेब खोज क्षमता का उपयोग करें
- उत्पादों को यहां खोजें: BigHaat.com, AgriBegri.com, IndiaMART.com, Amazon.in (कृषि अनुभाग), Flipkart.com
- जब संभव हो तो रासायनिक और जैविक/बायोलॉजिकल दोनों विकल्प शामिल करें
- वास्तविक उत्पाद नाम प्रदान करें (भारत में उपलब्ध ब्रांडेड उत्पाद)
- प्रतिष्ठित भारतीय कृषि ई-कॉमर्स साइटों से वास्तविक खरीद URL शामिल करें
- सत्यापित करें कि उत्पाद विशेष रूप से पहचाने गए रोग के लिए प्रभावी हैं
- भारतीय रुपये (₹) में अनुमानित मूल्य सीमा प्रदान करें

स्वस्थ पौधों के लिए, pesticideProducts को खाली सरणी [] पर सेट करें।

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
        "pesticideProducts": [
            {{"productName": "सटीक ब्रांडेड उत्पाद नाम", "type": "रासायनिक/जैविक/बायोलॉजिकल", "activeIngredient": "सक्रिय घटक का नाम", "price": "₹XXX - ₹XXX प्रति लीटर/किलो", "purchaseUrl": "https://exact-url-to-product-page", "seller": "वेबसाइट का नाम (BigHaat/AgriBegri/IndiaMART/Amazon/Flipkart)"}},
            {{"productName": "दूसरा उत्पाद", "type": "रासायनिक/जैविक/बायोलॉजिकल", "activeIngredient": "सक्रिय घटक", "price": "₹XXX - ₹XXX", "purchaseUrl": "https://url", "seller": "विक्रेता"}},
            {{"productName": "तीसरा उत्पाद", "type": "रासायनिक/जैविक/बायोलॉजिकल", "activeIngredient": "सक्रिय घटक", "price": "₹XXX - ₹XXX", "purchaseUrl": "https://url", "seller": "विक्रेता"}}
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
- सूची में नहीं दिए गए रोग का आविष्कार न करें।
- केवल सादा पाठ (कोई मार्कडाउन नहीं) और केवल वैध JSON का उपयोग करें।
- प्रत्येक विवरण फ़ील्ड को संक्षिप्त रखें (स्ट्रिंग्स के भीतर नई लाइन से बचें)।
केवल JSON के साथ जवाब दें।
"""

    if language == 'Hindi':
        return hindi_prompt
    return english_prompt