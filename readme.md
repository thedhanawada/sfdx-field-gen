# Salesforce Custom Field XML Generator

This tool simplifies the creation of Salesforce custom field metadata XML, helping you generate single fields or bulk-create multiple fields from a CSV file.

## Why I Built This

Creating custom fields in Salesforce can be tedious, especially when dealing with many fields. The existing options (Salesforce UI, manual XML editing, or Salesforce CLI) are often time-consuming and error-prone. This tool streamlines the process, making it faster and easier to generate the necessary XML.

## Features

*   **Single Field Generation:** Generate XML for a single custom field by filling in the details in a user-friendly form.
*   **Bulk Field Generation:** Create multiple custom fields at once by uploading a CSV file with your field definitions.
*   **CSV Template:** Download a pre-formatted CSV template to easily define your fields for bulk generation.
*   **Copy & Download XML:** Copy the generated XML to your clipboard or download it as a `.xml` file.
*   **Open Source:** This project is open-source, and your data remains in your browser. Nothing is sent to any server.

## How to Use

### Single Field Generation

1. Fill in the field details (API Name, Label, Type, etc.) in the form.
2. Click the "Generate XML" button.
3. Copy the generated XML and file name.
4. Create a new file in your Salesforce DX project's `fields` directory with the provided file name and paste the XML.
5. Deploy the field using Salesforce DX or Metadata API.

### Bulk Field Generation

1. Click the "Download CSV Template" button.
2. Open the CSV file and fill in your field definitions. Follow the specified format (API Name, Label, Type, Required, Help Text, Picklist Values). Use semicolons (;) to separate picklist values.
3. Upload the completed CSV file using the "Choose File" button.
4. Click the "Create Fields & Download Zip" button.
5. Download the generated ZIP file.
6. Extract the contents of the ZIP file into your Salesforce DX project's `fields` directory.
7. Deploy the fields using Salesforce DX or Metadata API.

## Pro Tips

*   Always include the `__c` suffix in your custom field API names.
*   For single picklist values, separate values with commas (e.g., `High, Medium, Low`).
*   For bulk CSV picklist values, separate values with semicolons (e.g., `High;Medium;Low`).
*   Use clear and user-friendly field labels.
*   Add help text to guide users.
*   Verify that your CSV headers match the template exactly for bulk uploads.

## Technical Details

*   **Frontend:** Vanilla JavaScript (ES6+), Fetch API, EJS templating, CSS custom properties, Prism.js.
*   **Backend:** Node.js, Express.js, Body Parser, `csv-parse`, `archiver`, `express-fileupload`.
*   **Deployment:** Hosted on Render with automatic deployments from GitHub.