 export const defaultInvoiceEnglish = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: white; }
     .container { max-width: 1000px; margin: {{marginTop}}mm auto {{marginBottom}}mm auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: {{paddingTop}}mm {{paddingRight}}mm {{paddingBottom}}mm {{paddingLeft}}mm; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .qr-section { margin-bottom: 20px; }
    .logo-section { position: relative; width: 192px; height: 80px; margin-left: auto; }
    .invoice-title { font-size: 2rem; font-weight: bold; color: #1f2937; }
    .invoice-number { color: #6b7280; }
    .company-info { text-align: right; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .bill-to, .supplier { margin-bottom: 20px; }
    .customer-logo, .supplier-logo { position: relative; width: 128px; height: 64px; margin-bottom: 10px; }
    .dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .table { width: 100%; margin-bottom: 40px; border-collapse: collapse; border: 1px solid #d1d5db; }
    .table th { background: #f3f4f6; border: 1px solid #d1d5db; padding: 12px; text-align: left; }
    .table td { border: 1px solid #d1d5db; padding: 12px; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
    .totals div { width: 256px; }
    .total-line { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-bold { font-weight: bold; font-size: 1.125rem; border-top: 1px solid #d1d5db; padding-top: 8px; }
    .notes { margin-bottom: 40px; }
    .stamp { display: flex; justify-content: flex-end; margin-top: 40px; }
    .stamp div { text-align: center; }
    .stamp img { width: 128px; height: 128px; object-fit: contain; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        {{#includeQR}}
        <div class="qr-section">
          <div style="display: inline-block; padding: 8px; background: white; border: 1px solid #d1d5db; border-radius: 4px;">
            <img src="{{qrCodeUrl}}" alt="ZATCA QR Code" style="width: 120px; height: 120px;" />
          </div>
          <p style="font-size: 0.875rem; color: #6b7280; margin-top: 8px;">ZATCA Compliant QR Code</p>
        </div>
        {{/includeQR}}
        <h1 class="invoice-title">INVOICE</h1>
        <p class="invoice-number">Invoice #{{invoiceId}}</p>
      </div>
      <div class="company-info">
        {{#companyLogo}}
        <div class="logo-section">
          <img src="{{companyLogo}}" alt="Company Logo" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
        {{/companyLogo}}
        <h2 style="font-size: 1.25rem; font-weight: 600;">{{companyName}}</h2>
        {{#companyNameAr}}
        <p style="font-size: 1.125rem;">{{companyNameAr}}</p>
        {{/companyNameAr}}
        <p>{{companyAddress}}</p>
        <p>{{companyEmail}}</p>
        <p>{{companyPhone}}</p>
        {{#companyVat}}<p>VAT: {{companyVat}}</p>{{/companyVat}}
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="details-grid">
      <div>
        <h3 style="font-weight: 600; margin-bottom: 8px;">Bill To:</h3>
        {{#customerLogo}}
        <div class="customer-logo">
          <img src="{{customerLogo}}" alt="Customer Logo" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
        {{/customerLogo}}
        <p style="font-weight: 500;">{{clientName}}</p>
        {{#customerNameAr}}
        <p style="font-size: 1rem;">{{customerNameAr}}</p>
        {{/customerNameAr}}
        <p>{{clientAddress}}</p>
        <p>{{clientEmail}}</p>
        {{#clientVat}}<p>VAT: {{clientVat}}</p>{{/clientVat}}
      </div>
      <div>
        <h3 style="font-weight: 600; margin-bottom: 8px;">Supplier:</h3>
        {{#supplierLogo}}
        <div class="supplier-logo">
          <img src="{{supplierLogo}}" alt="Supplier Logo" style="width: 100%; height: 100%; object-fit: contain;" />
        </div>
        {{/supplierLogo}}
        <p style="font-weight: 500;">{{supplierName}} {{#supplierNameAr}}({{supplierNameAr}}){{/supplierNameAr}}</p>
        <p>{{supplierAddress}}</p>
        <p>{{supplierEmail}}</p>
        {{#supplierVat}}<p>VAT: {{supplierVat}}</p>{{/supplierVat}}
      </div>
      <div>
        <div class="dates-grid">
          <div>
            <p style="color: #6b7280;">Invoice Date:</p>
            <p style="font-weight: 500;">{{invoiceDate}}</p>
          </div>
          <div>
            <p style="color: #6b7280;">Due Date:</p>
            <p style="font-weight: 500;">{{dueDate}}</p>
          </div>
          <div>
            <p style="color: #6b7280;">Status:</p>
            <p style="font-weight: 500; text-transform: capitalize;">{{status}}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>
            <div>
              <p style="font-weight: 500;">{{name}}</p>
              {{#description}}<p style="color: #6b7280; font-size: 0.875rem;">{{description}}</p>{{/description}}
            </div>
          </td>
          <td style="text-align: right;">{{quantity}}</td>
           <td style="text-align: right;">{{unitPrice}}</td>
           <td style="text-align: right;">{{total}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div>
        <div class="total-line">
          <span>Subtotal:</span>
          <span>{{subtotal}}</span>
        </div>
        <div class="total-line">
          <span>Tax ({{taxRate}}%):</span>
          <span>{{taxAmount}}</span>
        </div>
        <div class="total-line total-bold">
          <span>Total:</span>
          <span>{{total}}</span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    {{#notes}}
    <div class="notes">
      <h3 style="font-weight: 600; margin-bottom: 8px;">Notes:</h3>
      <p style="color: #6b7280;">{{notes}}</p>
    </div>
    {{/notes}}

    <!-- Company Stamp -->
    {{#companyStamp}}
    <div class="stamp">
      <div>
        <img src="{{companyStamp}}" alt="Company Stamp" />
        <p style="font-size: 0.875rem; color: #6b7280; margin-top: 8px;">Company Stamp</p>
      </div>
    </div>
    {{/companyStamp}}
  </div>
</body>
</html>`;