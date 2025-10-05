export const salesInvoiceArabic = `<!DOCTYPE html>
<html>
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
        --line-spacing: {{lineSpacing}};
      }
      p { margin: 0; }
      h1, h2, h3, h4, h5, h6 { margin: 0; }
      .invoice-template { font-family: 'ArabicFont', 'Tahoma', 'Arial Unicode MS', 'DejaVu Sans', 'Arial', var(--body-font), 'sans-serif'; margin: 0; padding: 10px; background: white; color: #000000; unicode-bidi: embed; direction: ltr; }
    .invoice-template .container { max-width: 100%; margin: 0; padding: 0; }
    @page { margin: 10mm; }
       .header-row-1 { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
       .header-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .qr-section { margin-bottom: 15px; }
    .logo-section { position: relative; width: 192px; height: 80px; margin-left: auto; }
      .invoice-title { font-size: 1.5rem; font-weight: bold; color: #1f2937; font-family: 'Tahoma', 'Arial Unicode MS', 'DejaVu Sans', 'Arial', var(--heading-font), 'sans-serif'; }
       .invoice-label { color: #374151; }
       .invoice-value { font-weight: 500; }
        .company-info, .billed-from { text-align: left; }
     .billed-from p, .bill-to p, .dates-grid p { padding: 2px 0; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px; }
     .bill-to, .billed-from, .invoice-details { border: 1px solid #d1d5db; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
     .invoice-details { width: 350px; }
    .customer-logo, .supplier-logo { position: relative; width: 128px; height: 64px; margin-bottom: 8px; }
    .dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
     .table { width: 100%; margin-bottom: 12px; border-collapse: collapse; border: 1px solid #d1d5db; }
          .table th { background: #f3f4f6; border: 1px solid #d1d5db; padding: 12px 8px; text-align: center; font-family: 'Tahoma', 'Arial Unicode MS', 'DejaVu Sans', 'Arial', var(--heading-font), 'sans-serif'; font-size: 11px; line-height: var(--line-spacing); vertical-align: middle; min-height: 1.1em; }
        .table td { border: 1px solid #d1d5db; padding: 2px 8px; text-align: center; line-height: var(--line-spacing); vertical-align: middle; min-height: 1.1em; }
     .totals-stamp-container { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .totals { flex: 1; }
      .totals div { width: 288px; }
     .total-line { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
    .total-bold { font-weight: bold; font-size: 1.125rem; border-top: 1px solid #d1d5db; padding-top: 6px; }
      .stamp { flex: 0 0 auto; margin-right: 30px; display: flex; justify-content: center; align-items: center; }
     .stamp div { text-align: center; }
      .stamp img { width: 150px; height: 150px; object-fit: contain; }
      .notes { margin-bottom: 12px; text-align: left; }

     /* Compact paragraph spacing */
     .company-info p,
     .bill-to p,
     .dates-grid p {
       margin: 1px 0;
     }
      .bilingual { display: flex; justify-content: space-between; align-items: center; }
      .english { flex: 1; text-align: left; }
       .arabic { flex: 1; text-align: left; direction: ltr; }

        /* PDF-specific spacing adjustments */
        @media print {
          .invoice-template { padding: 0; }
          .table th {
            background: #f3f4f6; border: 1px solid #d1d5db; padding: 16px; text-align: center; font-family: var(--heading-font), system-ui, sans-serif;
          }
          .table td {
            border: 1px solid #d1d5db; padding: 2px 16px; line-height: 1.0;
          }
          .company-info p,
          .bill-to p,
          .billed-from p,
          .dates-grid p {
            margin: 1px 0;
          }
         }
      @media print {
        .table td { line-height: var(--line-spacing); }
      }
   </style>
</head>
<body>
  <div class="invoice-template">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1 class="invoice-title" style="margin-bottom: 20px;">Sales Invoice / فاتورة مبيعات</h1>
        <div class="header-row-1">
           <div class="invoice-info invoice-details">
                <p><span class="invoice-label">Invoice # (فاتورة رقم)</span><br/><span class="invoice-value">{{invoiceId}}</span></p>
            <div class="dates-grid">
               <div>
                   <p style="color: #374151;">Invoice Date </br> (تاريخ الفاتورة)</p>
                <p style="font-weight: 500;">{{invoiceDate}}</p>
              </div>
               {{#dueDate}}
               <div>
                   <p style="color: #374151;">Due Date <br/> (تاريخ الاستحقاق)</p>
                 <p style="font-weight: 500;">{{dueDate}}</p>
               </div>
               {{/dueDate}}
            </div>
          </div>
         {{#includeQR}}
         <div class="qr-section">
           <div style="display: inline-block; padding: 8px; background: white; border: 1px solid #d1d5db; border-radius: 4px;">
             <img src="{{qrCodeUrl}}" alt="رمز QR متوافق مع زاتكا" style="width: 120px; height: 120px;" />
           </div>
         </div>
         {{/includeQR}}
       </div>
 <div class="header-row-2">
             <div>
               <h3 style="font-weight: 600; color: #6b7280; margin-bottom: 8px;">Billed To (إلى):</h3>
               <div class="bill-to">
                 {{#customerLogo}}
                 <div style="margin-bottom: 8px;">
                   <img src="{{customerLogo}}" alt="شعار العميل" style="width: 128px; height: 64px; object-fit: contain;" />
                 </div>
                 {{/customerLogo}}
                 <p style="font-weight: 500;">{{clientName}}</p>
                {{#customerNameAr}}
                <p style="font-size: 1rem;">{{customerNameAr}}</p>
                {{/customerNameAr}}
                 <p>📍 {{clientAddress}}</p>
                 <p>📧 {{clientEmail}}</p>
                 {{#clientVat}}<p>🏢 VAT (الرقم الضريبي) <br/> {{clientVat}}</p>{{/clientVat}}
               </div>
             </div>
             <div>
               <h3 style="font-weight: 600; color: #6b7280; margin-bottom: 8px;">Billed From (من):</h3>
               <div class="billed-from">
                 {{#companyLogo}}
                 <div style="margin-bottom: 8px;">
                   <img src="{{companyLogo}}" alt="شعار الشركة" style="width: 128px; height: 64px; object-fit: contain;" />
                 </div>
                 {{/companyLogo}}
                 <h2 style="font-size: 1.25rem; font-weight: 600;">{{companyName}}</h2>
                {{#companyNameAr}}
                <p style="font-size: 1.125rem;">{{companyNameAr}}</p>
                {{/companyNameAr}}
                <p>📍 {{companyAddress}}</p>
                <p>📧 {{companyEmail}}</p>
                {{#companyPhone}}<p>📞 {{companyPhone}}</p>{{/companyPhone}}
                 {{#companyVat}}<p>🏢 VAT (الرقم الضريبي) <br/> {{companyVat}}</p>{{/companyVat}}
               </div>
             </div>
          </div>
     </div>



    <!-- Items Table -->
    <table class="table">
       <thead>
           <tr>
               <th style="width: 20px;">#<br>(رقم)</th>
              <th>Description<br>(الوصف)</th>
              <th>Quantity<br>(الكمية)</th>
              <th>Unit Price<br>(سعر الوحدة)</th>
              <th>Total<br>(المجموع)</th>
           </tr>
       </thead>
       <tbody>
         {{#each items}}
         <tr>
            <td style="text-align: center; width: 20px;">{{@index}}</td>
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
                <span>TOTAL<br/> المجموع الكلي</span>
                <span>{{total}} ريال</span>
             </div>
        </div>
      </div>

       <!-- Company Stamp -->
       {{#companyStamp}}
       <div class="stamp">
         <div>
           <img src="{{companyStamp}}" alt="ختم الشركة" />
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
