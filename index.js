const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
const csv = require('csv-parse');
const archiver = require('archiver');
const fs = require('fs');
const fileUpload = require('express-fileupload');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/generate', (req, res) => {
  const { fullName, label, type, required, inlineHelpText, picklistValues } = req.body;

  const fileName = `fields/${fullName}.field-meta.xml`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
  <fullName>${fullName}</fullName>
  <label>${label}</label>
  <type>${type}</type>
  <required>${required === 'on'}</required>`;

  if (type === 'Picklist' && picklistValues) {
      const values = picklistValues.split(',').map(v => v.trim());
      xml += `
  <valueSet>
      <restricted>true</restricted>
      <valueSetDefinition>
          <sorted>false</sorted>`;
      values.forEach(value => {
          xml += `
          <value>
              <fullName>${value}</fullName>
              <default>false</default>
              <label>${value}</label>
          </value>`;
      });
      xml += `
      </valueSetDefinition>
  </valueSet>`;
  }

  if (inlineHelpText) {
      xml += `
  <inlineHelpText>${inlineHelpText}</inlineHelpText>`;
  }

  xml += `
</CustomField>`;

  res.json({
      xml: xml,
      fileName: fileName
  });
});


app.get('/download', (req, res) => {
  const xml = req.query.xml;
  if (xml) {
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="custom_field.xml"');
    res.send(xml);
  } else {
    res.redirect('/');
  }
});

app.get('/template', (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="field_template.csv"');
  res.send('API Name,Label,Type,Required,Help Text,Picklist Values\nMy_Field__c,My Field,Text,false,Help text here,Value1;Value2;Value3');
});

// Route to process CSV upload
app.post('/bulk-generate', async (req, res) => {
  if (!req.files || !req.files.csv) {
      return res.status(400).send('No file uploaded');
  }

  const csvFile = req.files.csv;
  const records = [];

  // Parse CSV
  csv.parse(csvFile.data.toString(), {
      columns: true,
      skip_empty_lines: true
  }, (err, data) => {
      if (err) {
          return res.status(400).send('Error parsing CSV');
      }

      // Create zip file
      const archive = archiver('zip', {
          zlib: { level: 9 }
      });

      res.attachment('custom_fields.zip');
      archive.pipe(res);

      // Process each row
      data.forEach(row => {
          const xml = generateFieldXML(row); // Create a helper function for this
          archive.append(xml, { name: `fields/${row['API Name']}.field-meta.xml` });
      });

      archive.finalize();
  });
});

function generateFieldXML(field) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
  <fullName>${field['API Name']}</fullName>
  <label>${field['Label']}</label>
  <type>${field['Type']}</type>
  <required>${field['Required'].toLowerCase() === 'true'}</required>`;

  if (field['Type'] === 'Picklist' && field['Picklist Values']) {
      const values = field['Picklist Values'].split(';').map(v => v.trim());
      xml += `
  <valueSet>
      <restricted>true</restricted>
      <valueSetDefinition>
          <sorted>false</sorted>`;
      values.forEach(value => {
          xml += `
          <value>
              <fullName>${value}</fullName>
              <default>false</default>
              <label>${value}</label>
          </value>`;
      });
      xml += `
      </valueSetDefinition>
  </valueSet>`;
  }

  if (field['Help Text']) {
      xml += `
  <inlineHelpText>${field['Help Text']}</inlineHelpText>`;
  }

  xml += `
</CustomField>`;

  return xml;
}


app.listen(port, () => {
  console.log(`sfdx-field-gen listening at http://localhost:${port}`);
});
