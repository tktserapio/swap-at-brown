import puppeteer from "puppeteer";
import { MongoClient } from "mongodb";
import readline from "readline";
import dotenv from "dotenv";

// Create a readline interface to take user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: false,
});


const getClassCodeFromUser = () => {
  return new Promise((resolve) => {
	rl.question('Enter class code: ', (answer) => {
  	resolve(answer);
  	rl.close();  // Close the readline interface after input
	});
  });
};

const getClassInfo = async (classLink) => {
	try {
    	// Wait for the class title element to load and extract its text content
    	//const classTitle = await classLink.$eval('div.text.col-8.detail-title.text--huge', el => el.textContent.trim());
   	 
    	// Wait for the class code element to load and extract its text content
    	const classCode = await classLink.$eval('div.dtl-course-code', el => el.textContent.trim());
    	// Scrape the sections (e.g., S01, S02, etc.) and filter out unwanted text
    	const rawSections = await classLink.$$eval('div.course-section-section[role="rowheader"]', (sectionElements) => {
        	return sectionElements.map(el => el.textContent.trim());
    	});

    	// Post-process sections using regex to extract only valid section codes (S##, C##, L##)
    	const validSections = rawSections
        	.map(section => {
        	// Use a regex to extract section codes that start with S, C, or L followed by two digits
        	const match = section.match(/([SCL]\d{2})/);
        	return match ? match[0] : null; // Return the match or null if no valid section found
        	})
        	.filter(section => section !== null); // Remove any null values (invalid sections)

    	const uniqueSections = [...new Set(validSections)];

    	return {
        	//classTitle,
        	classCode,
        	sections: uniqueSections, // Include the scraped sections
    	};
    	} catch (error) {
        	console.log("Error extracting class info:", error);
        	return null;  // Return null if there's an issue extracting the data
	}
  };

const getClasses = async () => {
    
	const startCode = await getClassCodeFromUser();  // Get class code from the user

  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will in full width and height)
  const browser = await puppeteer.launch({
	headless: false,
	defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // On this new page:
  // - open the "https://cab.brown.edu/" website
  // - wait until the dom content is loaded (HTML is ready)
  await page.goto("https://cab.brown.edu/", {
	waitUntil: "domcontentloaded",
  });

   // Wait for the button to be available and click it
   await page.waitForSelector('#search-button');  // Ensure the button exists
   await page.click('#search-button');  // Click the button

  // Wait for the new page to load
  await page.waitForSelector('.panels', {
	waitUntil: "domcontentloaded",  // Wait for 60 seconds max
  });

  // Wait for the class links to load
  await page.waitForSelector('a.result__link');


//   Select all class links that match the input code (partial match)
  const classLinks = await page.$$(`a.result__link[data-group*="code:${startCode}"]`); // Partial match with 'code:'

  if (classLinks.length > 0) {
	await client.connect(); // Connect to MongoDB
	const db = client.db("LeSwapDatabase");
	const collection = db.collection("courses");

	for (let i = 0; i < classLinks.length; i++) {
  	const classLink = classLinks[i];

   	// Click on the class link to go to the class details page
   	await classLink.click();

   	// Wait for the class page to load (adjust the selector if needed)
   	await page.waitForSelector('div.text.col-8.detail-title.text--huge', {
     	timeout: 5000,  // Wait up to 5 seconds
   	});

  	const classInfo = await getClassInfo(page);

  	if (classInfo) {
    	console.log(classInfo);
    	// await collection.insertOne(classInfo); // Store in MongoDB
    	await collection.updateOne(
      	{ classCode: classInfo.classCode }, // Search by unique class code
      	{ $set: classInfo }, // Update or insert the data
      	{ upsert: true } // Insert if not found
    	);
  	}

  	await page.waitForSelector('a.result__link');
	}
	await client.close();
  } else {
	console.log(`No classes found starting with: ${startCode}`);
  }
 
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Close the browser
  await browser.close();
};

// Start the scraping
getClasses();