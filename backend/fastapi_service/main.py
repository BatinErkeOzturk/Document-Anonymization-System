import spacy
import fitz  # PyMuPDF
from fastapi import FastAPI
from pydantic import BaseModel
import os
import re
import cv2
import numpy as np
import io
from PIL import Image

app = FastAPI()

# spaCy modelini yüklüyoruz
nlp = spacy.load("en_core_web_sm")

# Regex yapılarım
email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
person_regex = r'\b[A-Za-z]+(?: [A-Za-z]+)+\b'
gpe_pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b'

# Anonimleşmemesi gerekenler
exempt_patterns = [
    r"\bInternational Conference on Electronic Information Engineering\b",
    r"\bConvolutional Neural Network\b",
    r"\bApril 2023\b",
    r"\bDigital\b",
    r"\bEmotion Recognition Using Temporally Localized\b",
    r"\bDataset\b",
    r"\bRecognition\b",
    r"\bGraduate Student\b"
]

# Anonimleşmesi gerekenler
sensitive_terms = {
    "MAJITHIA TEJAS VINODBHAI",
    "Mrigank Singh",
    "S. Indu"
}

# Listeler ve sıfırlanmaları
person_list = set()
person_variations = set()
gpe_list = set()
email_list = set()

def generate_name_variations(full_name):
    """Generate various forms of a full name"""
    variations = set()
    parts = full_name.split()
    
    if len(parts) >= 2:
        # "M. Asif"
        variations.add(f"{parts[0][0]}. {parts[-1]}")
        
        # "Mohammed A."
        variations.add(f"{parts[0]} {parts[-1][0]}.")
        
        # "M. A. Surname"
        if len(parts) >= 3:
            middle_initials = ' '.join([p[0] + '.' for p in parts[1:-1]])
            variations.add(f"{parts[0][0]}. {middle_initials} {parts[-1]}")
            
            # "Mohammed A. Surname"
            middle_initials = ' '.join([p[0] + '.' for p in parts[1:-1]])
            variations.add(f"{parts[0]} {middle_initials} {parts[-1]}")
    
    return variations

def detect_faces(image_data):
    """
    Detect faces in an image and return their coordinates
    Returns a list of (x, y, w, h) tuples
    """
    try:
        # Resmi opencv formatına çeviriyorum
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return []
        
        # Resmin boyutlarını alıyorum
        height, width = img.shape[:2]
        
        # Yüz tanıma için gri ye çeviriyorum
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        # Yüz bulunmazsa daha hassas çalışıyorum
        if len(faces) == 0:
            faces = face_cascade.detectMultiScale(gray, 1.05, 3)
        
        # Bulunan yüzleri işliyorum
        face_regions = []
        for (x, y, w, h) in faces:
            expansion_factor = 0.3
            new_w = int(w * (1 + expansion_factor))
            new_h = int(h * (1 + expansion_factor))
            
            new_x = max(0, x - (new_w - w) // 2)
            new_y = max(0, y - (new_h - h) // 2)
            
            new_w = min(width - new_x, new_w)
            new_h = min(height - new_y, new_h)
            
            face_regions.append((new_x, new_y, new_w, new_h))
        
        return face_regions, img
    except Exception as e:
        print(f"Error in face detection: {e}")
        return [], None

def create_blurred_face_image(img, face_x, face_y, face_w, face_h):
    """
    Extract a face region, blur it heavily, and return the blurred image
    """
    try:
        face_region = img[face_y:face_y+face_h, face_x:face_x+face_w]
        
        # Güçlü gaussan filtresi kullanıyorum
        blurred_face = cv2.GaussianBlur(face_region, (99, 99), 30)
        
        height, width = face_region.shape[:2]
        
        # Blurlu yüzü döndürüyorum
        return blurred_face
    except Exception as e:
        print(f"Error creating blurred face image: {e}")
        return None

class AnonymizeRequest(BaseModel):
    file_path: str

@app.post("/anonymize-pdf")
async def anonymize_pdf(request: AnonymizeRequest):
    try:
        if request.file_path.startswith("uploads/"):
            file_path = f"/Users/batinerkeozturk/Desktop/DocumentSystem/{request.file_path}"
        else:
            file_path = f"/Users/batinerkeozturk/Desktop/DocumentSystem/uploads/{request.file_path}"
        
        print(f"Received file_path: {file_path}")
        
        if not os.path.exists(file_path):
            print(f"Error: File does not exist at {file_path}")
            return {"error": f"File not found at {file_path}"}
        
        person_list.clear()
        person_variations.clear()
        gpe_list.clear()
        email_list.clear()
        
        doc = fitz.open(file_path)
        abstract_detected = False
        
        for page_num, page in enumerate(doc):
            print(f"Processing page {page_num + 1}...")
            text = page.get_text()
            lines = text.split("\n")
            
            for line in lines:
                if "abstract" in line.lower():
                    abstract_detected = True
                    print("ABSTRACT detected! Stopping further entity collection.")
                    break
                
                if any(re.search(pattern, line) for pattern in exempt_patterns):
                    print(f"Skipping anonymization for exempted phrase: {line}")
                    continue
                
                if not abstract_detected:
                    doc_spacy = nlp(line)
                    for ent in doc_spacy.ents:
                        if ent.label_ == "PERSON" and re.match(person_regex, ent.text):
                            print(f"Confirmed PERSON: {ent.text}")
                            person_list.add(ent.text)
                        elif ent.label_ == "GPE" or re.match(gpe_pattern, ent.text):
                            print(f"Confirmed GPE: {ent.text}")
                            gpe_list.add(ent.text)
                    
                    emails = re.findall(email_pattern, line)
                    for email in emails:
                        print(f"Collected email: {email}")
                        email_list.add(email)
            
            if abstract_detected:
                break

        # İsim varyasyonları oluşturuyorum
        for person in list(person_list):
            variations = generate_name_variations(person)
            print(f"Generated variations for '{person}': {variations}")
            person_variations.update(variations)

        print("Collected entities:")
        print(f"PERSONS: {person_list}")
        print(f"PERSON VARIATIONS: {person_variations}")
        print(f"GPEs: {gpe_list}")
        print(f"Emails: {email_list}")

        # Anonimleştirme
        for page_num, page in enumerate(doc):
            print(f"Anonymizing page {page_num + 1}...")
            
            # Metin anonimleştirme
            all_sensitive_data = person_list | person_variations | gpe_list | email_list | sensitive_terms
            
            for term in all_sensitive_data:
                text_instances = page.search_for(term, quads=True)
                
                if text_instances:
                    print(f"Found {len(text_instances)} instances of '{term}' on page {page_num + 1}")
                    
                    for inst in text_instances:
                        rect = inst.rect
                        page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))
                        text_x = rect.x0 + 2
                        text_y = rect.y0 + rect.height / 2
                        placeholder_text = "ANONYMIZED"
                        if term in person_list or term in person_variations:
                            placeholder_text = "PERSON"
                        elif term in gpe_list:
                            placeholder_text = "GPE"
                        elif term in email_list:
                            placeholder_text = "EMAIL"
                        
                        page.insert_text((text_x, text_y), placeholder_text, color=(0, 0, 0), fontsize=6)
            
            # Resim anonimleştirme
            try:
                image_list = page.get_images(full=True)
                
                for img_index, img_info in enumerate(image_list):
                    try:
                        xref = img_info[0]
                        base_image = doc.extract_image(xref)
                        image_data = base_image["image"]
                        
                        img_width = base_image["width"]
                        img_height = base_image["height"]
                        
                        img_rect = page.get_image_bbox(img_info)
                        
                        face_regions, original_img = detect_faces(image_data)
                        
                        if face_regions and original_img is not None:
                            print(f"Found {len(face_regions)} faces in image on page {page_num+1}")
                            
                            scale_x = (img_rect.x1 - img_rect.x0) / img_width
                            scale_y = (img_rect.y1 - img_rect.y0) / img_height
                            
                            for face_x, face_y, face_w, face_h in face_regions:
                                blurred_face = create_blurred_face_image(original_img, face_x, face_y, face_w, face_h)
                                
                                if blurred_face is not None:
                                    pdf_x0 = img_rect.x0 + (face_x * scale_x)
                                    pdf_y0 = img_rect.y0 + (face_y * scale_y)
                                    pdf_x1 = pdf_x0 + (face_w * scale_x)
                                    pdf_y1 = pdf_y0 + (face_h * scale_y)
                                    
                                    face_rect = fitz.Rect(pdf_x0, pdf_y0, pdf_x1, pdf_y1)
                                    
                                    is_success, buffer = cv2.imencode(".png", blurred_face)
                                    
                                    if is_success:
                                        page.insert_image(face_rect, stream=io.BytesIO(buffer.tobytes()))
                                        print(f"Inserted blurred face at {face_rect}")
                                    else:
                                        print("Failed to encode the blurred face image")
                    except Exception as e:
                        print(f"Error processing image {img_index} on page {page_num+1}: {e}")
                        continue
            except Exception as e:
                print(f"Error processing images on page {page_num+1}: {e}")

        original_file_name = os.path.basename(file_path)
        file_name_without_extension, file_extension = os.path.splitext(original_file_name)
        anonymized_file_name = f"{file_name_without_extension}_anon{file_extension}"
        anonymized_file_path = f"/Users/batinerkeozturk/Desktop/DocumentSystem/uploads/{anonymized_file_name}"
        
        try:
            print(f"Saving anonymized file to: {anonymized_file_path}")
            doc.save(anonymized_file_path)
            print("File saved successfully.")
        except Exception as e:
            print(f"Error saving file: {e}")
            return {"error": f"Could not save anonymized file: {e}"}
        
        return {"file_path": f"uploads/{anonymized_file_name}"}
    
    except Exception as e:
        print(f"Error during anonymization: {e}")
        return {"error": str(e)}
    