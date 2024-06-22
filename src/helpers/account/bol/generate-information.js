import { uniqueNamesGenerator, colors, animals, NumberDictionary, adjectives } from 'unique-names-generator';
import { addresses } from './data-dictionary-address.js'
import { dutchFirstNames, dutchMiddleNames, dutchLastNames} from './data-dictionary-name.js'


const numberDictionary = NumberDictionary.generate({ min: 1, max: 2024 });

const emailProviders = ['gmail.com', 'outlook.com', 'protonmail.com', 'yahoo.com', 'icloud.com', 'live.com'];

// Function to generate a random Dutch name and email
const separators = ['_', '.'];
const separatorsWithNone = ['_', '.', ''];
const dictionaries = [colors, animals, adjectives, numberDictionary];

const getRandomDictionaries = (dictionaries) => {
  const minLength = 1;
  const maxLength = 3;
  const randomLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  const shuffledDictionaries = [...dictionaries].sort(() => 0.5 - Math.random());
  return shuffledDictionaries.slice(0, randomLength);
};

const getRandomSeparator = (separators) => {
  if (!Array.isArray(separators) || separators.length === 0) {
    throw new Error('Input must be a non-empty array of separators');
  }

  const randomIndex = Math.floor(Math.random() * separators.length);
  return separators[randomIndex];
};

export const generateRandomDutchNameAndEmail = () => {

  const uniqueSeparator = getRandomSeparator(separators);
  const uniqueSeparatorWithNone = getRandomSeparator(separatorsWithNone);
  const randomDictionaries = getRandomDictionaries(dictionaries);

  const randomAddedWord = uniqueNamesGenerator({
    dictionaries: randomDictionaries,
    length: randomDictionaries.length, // First name, middle name, last name
    separator: uniqueSeparatorWithNone,
    style: 'lowerCase' // Capitalize the first letter of each part
  });

  const nameConfig = {
    dictionaries: [dutchFirstNames, dutchMiddleNames, dutchLastNames],
    length: 3, // First name, middle name, last name
    separator: ' ',
    style: 'lowerCase' // Capitalize the first letter of each part
  };

  // Generate a random full name
  const randomName = uniqueNamesGenerator(nameConfig).split(' ');

  // Construct the name object
  const nameObject = {
    firstname: randomName[0],
    middlename: randomName[1],
    lastname: randomName[2]
  };

  // Generate a random email address
  const emailProvider = emailProviders[Math.floor(Math.random() * emailProviders.length)];
  const emailUsername = `${randomName[0]}${uniqueSeparator}${randomName[2]}${uniqueSeparator}${randomAddedWord}`;
  const email = `${emailUsername}@${emailProvider}`;

  // Add email to the name object
  nameObject.email = email;

  return nameObject;
}

export const generateRandomDateOfBirth = () => {
    // Generate a random year between 1975 and 2003
    const year = Math.floor(Math.random() * (2003 - 1975 + 1)) + 1975;
  
    // Generate a random month (0-11)
    const month = Math.floor(Math.random() * 12);
  
    // Generate a random day of the month (1-28/30/31, depending on the month)
    const maxDaysInMonth = new Date(year, month + 1, 0).getDate(); // Get the last day of the month
    const day = Math.floor(Math.random() * maxDaysInMonth) + 1;
  
    // Format day and month to ensure they have two digits
    const formattedDay = day < 10 ? `0${day}` : `${day}`;
    const formattedMonth = month < 9 ? `0${month + 1}` : `${month + 1}`;
  
    // Construct the formatted date string in dd-mm-yyyy format
    const dob = `${formattedDay}-${formattedMonth}-${year}`;
  
    return dob;
  };

  export const generateRandomDutchPhoneNumber = () => {
    const mobilePrefixes = ['06']; // Mobile phone number prefixes in Netherlands
    const landlinePrefixes = ['010', '020', '030', '040', '050', '070', '071', '072', '073', '074', '075', '076', '077', '078', '079']; // Landline phone number prefixes in Netherlands
  
    // Choose randomly between mobile or landline
    const isMobile = Math.random() < 0.5; // 50% chance for mobile, 50% for landline
    const prefix = isMobile
      ? mobilePrefixes[Math.floor(Math.random() * mobilePrefixes.length)]
      : landlinePrefixes[Math.floor(Math.random() * landlinePrefixes.length)];
  
    // Generate 8 random digits
    const randomNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  
    // Construct the phone number
    const phoneNumber = `${prefix}-${randomNumber}`;
  
    return phoneNumber;
  };

  // Function to generate a strong password
export const generateStrongPassword = (length = 12) => {
    // Define characters to use in the password
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()-_=+[{]}|;:,<.>/?';
  
    // Combine all characters
    const allCharacters = lowercase + uppercase + numbers + symbols;
  
    // Initialize password variable
    let password = '';
  
    // Generate random characters
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allCharacters.length);
      password += allCharacters[randomIndex];
    }
  
    return password;
  };

  export const getRandomAddress = () => {
    const randomIndex = Math.floor(Math.random() * addresses.length);
    return addresses[randomIndex];
  }
