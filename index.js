const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/generate', (req, res) => {
  const { fullName, label, type, required, inlineHelpText, picklistValues } = req.body;

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

  res.send(xml);
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

app.listen(port, () => {
  console.log(`sfdx-field-gen listening at http://localhost:${port}`);
});
