import { v4 as uuidv4 } from "uuid";
import path from "path";

export const generateImageName = (file) => {
  const fileExtension = path.extname(file.originalname); 
  const uniqueId = uuidv4();
  
  // Create custom human-readable date format
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = now.toLocaleString('en-US', { month: 'long' });
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const formattedDate = `${day}-${month}-${year}-${hours}-${minutes}`;
  
  const identifier = file.fieldname; 

  const secureFileName = `${identifier}--${uniqueId}--${formattedDate}${fileExtension}`;
  
  console.log("Generated Name:", secureFileName);
  
  return secureFileName;
};