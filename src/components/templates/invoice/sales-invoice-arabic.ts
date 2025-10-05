export const salesInvoiceArabic = `<!DOCTYPE html>
<html dir="rtl">
<head>
   <meta charset="utf-8">
   <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
   <title>فاتورة مبيعات</title>
    <style>
     @font-face {
       font-family: 'ArabicFont';
       src: local('Tahoma'), local('Arial Unicode MS'), local('DejaVu Sans');
       unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF;
     }
     :root {
       --heading-font: {{headingFont}};
       --body-font: {{bodyFont}};
     }
     .invoice-template { font-family: 'ArabicFont', 'Tahoma', 'Arial Unicode MS', 'DejaVu Sans', 'Arial', var(--body-font), 'sans-serif'; margin: 0; padding: 20px; background: white; color: #000000; unicode-bidi: embed; }
    .invoice-template .container { max-width: 100%; margin: 0; padding: 0; }
    @page { margin: 20mm; }
     .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .qr-section { margin-bottom: 15px; }
    .logo-section { position: relative; width: 192px; height: 80px; margin-left: auto; }
     .invoice-title { font-size: 1.5rem; font-weight: bold; color: #1f2937; font-family: 'Tahoma', 'Arial Unicode MS', 'DejaVu Sans', 'Arial', var(--heading-font), 'sans-serif'; }
    .invoice-number { color: #6b7280; }
    .company-info { text-align: right; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .bill-to, .supplier { margin-bottom: 15px; }
    .customer-logo, .supplier-logo { position: relative; width: 128px; height: 64px; margin-bottom: 8px; }
    .dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
     .table { width: 100%; margin-bottom: 12px; border-collapse: collapse; border: 1px solid #d1d5db; }
        .table th { background: #f3f4f6; border: 1px solid #d1d5db; padding: 4px 6px; text-align: right; font-family: 'Tahoma', 'Arial Unicode MS', 'DejaVu Sans', 'Arial', var(--heading-font), 'sans-serif'; line-height: 1.3; vertical-align: middle; min-height: 1.1em; }
      .table td { border: 1px solid #d1d5db; padding: 4px 6px; text-align: right; line-height: 1.3; vertical-align: middle; min-height: 1.1em; }
     .totals-stamp-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .totals { flex: 1; }
     .totals div { width: 320px; }
    .total-line { display: flex; justify-content: space-between; padding: 6px 0; }
    .total-bold { font-weight: bold; font-size: 1.125rem; border-top: 1px solid #d1d5db; padding-top: 6px; }
     .stamp { flex: 0 0 auto; margin-left: 30px; display: flex; justify-content: center; align-items: center; }
    .stamp div { text-align: center; }
     .stamp img { width: 80px; height: 80px; object-fit: contain; }
     .notes { margin-bottom: 12px; text-align: right; }

     /* Compact paragraph spacing */
     .company-info p,
     .bill-to p,
     .dates-grid p {
       margin: 1px 0;
     }
     .bilingual { display: flex; justify-content: space-between; align-items: center; }
     .english { flex: 1; text-align: left; }
     .arabic { flex: 1; text-align: right; direction: rtl; }

      /* PDF-specific spacing adjustments */
      @media print {
        .invoice-template { padding: 0; }
        .table th, .table td {
          padding: 1px 3px;
          line-height: 1.0;
        }
        .company-info p,
        .bill-to p,
        .dates-grid p {
          margin: 1px 0;
        }
      }
  </style>
</head>
<body>
  <div class="invoice-template">
    <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        {{#includeQR}}
        <div class="qr-section">
          <div style="display: inline-block; padding: 8px; background: white; border: 1px solid #d1d5db; border-radius: 4px;">
            <img src="{{qrCodeUrl}}" alt="رمز QR متوافق مع زاتكا" style="width: 120px; height: 120px;" />
          </div>
        </div>
        {{/includeQR}}
            <h1 class="invoice-title" style="text-align: right;">Sales Invoice<br>فاتورة مبيعات</h1>
            <p class="invoice-number" style="text-align: right;">Invoice # (فاتورة رقم) {{invoiceId}}</p>
      </div>
      <div class="company-info">
         {{#companyLogo}}
         <div class="logo-section">
           <img src="{{companyLogo}}" alt="شعار الشركة" style="width: 100%; height: 100%; object-fit: contain;" />
         </div>
         {{/companyLogo}}
          {{#companyName}}
          <h2 style="font-size: 1.125rem; font-weight: 600;">{{companyName}}</h2>
          {{/companyName}}
            {{#companyNameAr}}
            <p style="font-size: 1.125rem; font-weight: 600;">{{companyNameAr}}</p>
            {{/companyNameAr}}
            <p>📍{{companyAddress}}</p>
            <p>📧 {{companyEmail}}</p>
            {{#companyPhone}}<p>📞 {{companyPhone}}</p>{{/companyPhone}}
           {{#companyVat}}<p>VAT Number (الرقم الضريبي): {{companyVat}}</p>{{/companyVat}}
      </div>
    </div>

      <!-- Invoice Details -->
       <div style="text-align: right; margin-bottom: 12px;">
          <h3 style="font-weight: 600; margin-bottom: 8px;">Bill To (إلى):</h3>
       {{#customerLogo}}
       <div class="customer-logo">
         <img src="{{customerLogo}}" alt="شعار العميل" style="width: 100%; height: 100%; object-fit: contain;" />
       </div>
       {{/customerLogo}}
       <p style="font-weight: 500;">{{clientName}}</p>
       {{#customerNameAr}}
       <p style="font-size: 1rem;">{{customerNameAr}}</p>
       {{/customerNameAr}}
       <p>{{clientAddress}}</p>
       <p>{{clientEmail}}</p>
         {{#clientVat}}<p>VAT Number (الرقم الضريبي): {{clientVat}}</p>{{/clientVat}}
     </div>

    <!-- Dates Section -->
     <div style="margin-bottom: 12px;">
      <div class="dates-grid">
        <div>
             <p style="color: #6b7280;">Invoice Date (تاريخ الفاتورة):</p>
           <p style="font-weight: 500;">{{invoiceDate}}</p>
         </div>
          {{#dueDate}}
          <div>
              <p style="color: #6b7280;">Due Date (تاريخ الاستحقاق):</p>
            <p style="font-weight: 500;">{{dueDate}}</p>
          </div>
          {{/dueDate}}
      </div>
    </div>

    <!-- Items Table -->
    <table class="table">
      <thead>
          <tr>
             <th>Description<br>(الوصف)</th>
             <th>Quantity<br>(الكمية)</th>
             <th>Unit Price<br>(سعر الوحدة)</th>
             <th>Total<br>(المجموع)</th>
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
          <td>{{quantity}}</td>
          <td>{{unitPrice}} ريال</td>
          <td>{{total}} ريال</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <!-- Totals and Stamp -->
    <div class="totals-stamp-container">
      <div class="totals">
        <div>
            <div class="total-line">
               <span>Subtotal (المجموع الفرعي):</span>
               <span>{{subtotal}} ريال</span>
             </div>
             <div class="total-line">
               <span>Tax (الضريبة) ({{taxRate}}%):</span>
               <span>{{taxAmount}} ريال</span>
             </div>
             <div class="total-line total-bold">
               <span>TOTAL (المجموع الكلي):</span>
               <span>{{total}} ريال</span>
            </div>
        </div>
      </div>

      <!-- Company Stamp -->
      {{#companyStamp}}
      <div class="stamp">
        <div>
          <img src="{{companyStamp}}" alt="ختم الشركة" />
          <p style="font-size: 0.75rem; color: #6b7280; margin-top: 6px;">ختم الشركة</p>
        </div>
      </div>
      {{/companyStamp}}
    </div>

    <!-- Notes -->
    {{#notes}}
    <div class="notes">
       <h3 style="font-weight: 600; margin-bottom: 6px;">Notes (ملاحظات):</h3>
      <p style="color: #6b7280;">{{notes}}</p>
    </div>
    {{/notes}}
    </div>
  </div>
</body>
</html>`;
