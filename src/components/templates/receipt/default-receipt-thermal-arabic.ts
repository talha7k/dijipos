export const defaultArabicReceiptTemplate = `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="utf-8">
  <title>إيصال</title>
    <style>
     :root {
       --heading-font: {{headingFont}};
       --body-font: {{bodyFont}};
       --line-spacing: {{lineSpacing}};
     }
     body { font-family: var(--body-font), 'Amiri', serif; margin: {{marginTop}}mm {{marginRight}}mm {{marginBottom}}mm {{marginLeft}}mm; padding: {{paddingTop}}mm {{paddingRight}}mm {{paddingBottom}}mm {{paddingLeft}}mm; font-size: 12px; max-width: {{paperWidth}}px; line-height: var(--line-spacing); }
    .header { text-align: center; margin-bottom: 10px; }
    .header h2 { font-family: var(--heading-font), 'Amiri', serif; }
    .custom-header { text-align: center; margin-bottom: 10px; font-weight: bold; font-family: var(--heading-font), 'Amiri', serif; }
    .content { margin-bottom: 10px; }
    .footer { text-align: center; margin-top: 10px; }
    .custom-footer { text-align: center; margin-bottom: 10px; font-style: italic; font-family: var(--heading-font), 'Amiri', serif; }
    .line { display: flex; justify-content: space-between; }
    .total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 10px; text-align: right; }
    .total-amount { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { text-align: right; padding: 2px 10px; }
    th { font-weight: bold; border-bottom: 1px solid #000; font-family: var(--heading-font), 'Amiri', serif; }
    .amount-col { text-align: right; }
    .qty-col { text-align: center; width: 50px; }
    .item-col { width: calc({{paperWidth}}px - 120px); }
    .bilingual { margin-bottom: 2px; text-align: right; }
     .english { text-align: center; direction: ltr; margin-bottom: 1px; }
    .arabic { text-align: right; direction: rtl; }
  </style>
</head>
<body>


     <div class="header">
       {{#companyLogo}}
       <div style="text-align: center; margin-bottom: 10px;">
         <img src="{{companyLogo}}" alt="شعار الشركة" style="max-width: 100px; max-height: 50px;" />
       </div>
       {{/companyLogo}}
        <div style="text-align: center; margin-bottom: 10px;">
          <div class="english"><h2>{{companyName}}</h2></div>
          {{#companyNameAr}}
          <div class="arabic" style="text-align: center;"><h2>{{companyNameAr}}</h2></div>
          {{/companyNameAr}}
        </div>
       <div class="bilingual">
         <p><strong>Address</strong> <span style="color: #666;">(العنوان)</span>: {{companyAddress}}</p>
       </div>
       <div class="bilingual">
         <p><strong>Tel</strong> <span style="color: #666;">(الهاتف)</span>: {{companyPhone}}</p>
       </div>
       {{#companyVat}}
       <div class="bilingual">
         <p><strong>VAT Number</strong> <span style="color: #666;">(الرقم الضريبي)</span>: {{companyVat}}</p>
       </div>
       {{/companyVat}}
       <hr>
       {{#customHeader}}
       <div class="custom-header">
         {{customHeader}}
       </div>
          <hr>
       {{/customHeader}}
       <div class="bilingual">
         <p><strong>Order #</strong> <span style="color: #666;">(طلب #)</span>: {{orderNumber}}</p>
         {{#queueNumber}}<p><strong>Queue #</strong> <span style="color: #666;">(رقم الدور)</span>: {{queueNumber}}</p>{{/queueNumber}}
         <p><strong>Type</strong> <span style="color: #666;">(النوع)</span>: {{orderType}}</p>
         <p><strong>Date</strong> <span style="color: #666;">(التاريخ)</span>: {{formattedDate}}</p>
       </div>
       {{#tableName}}
       <div class="bilingual">
         <p><strong>Table</strong> <span style="color: #666;">(الطاولة)</span>: {{tableName}}</p>
       </div>
       {{/tableName}}
       {{#customerName}}
       <div class="bilingual">
         <p><strong>Customer</strong> <span style="color: #666;">(العميل)</span>: {{customerName}}</p>
       </div>
       {{/customerName}}
       {{#createdByName}}
       <div class="bilingual">
         <p><strong>Served by</strong> <span style="color: #666;">(خدم من قبل)</span>: {{createdByName}}</p>
       </div>
       {{/createdByName}}
      <hr>
    </div>

    <div class="content">
      <table>
         <thead>
           <tr>
             <th class="item-col">
               <strong>Item</strong><br><span style="color: #666; font-size: 11px;">(الصنف)</span>
             </th>
             <th class="qty-col">
               <strong>Qty</strong><br><span style="color: #666; font-size: 11px;">(الكمية)</span>
             </th>
             <th class="amount-col">
               <strong>Amount</strong><br><span style="color: #666; font-size: 11px;">(المبلغ)</span>
             </th>
           </tr>
         </thead>
        <tbody>
          {{#each items}}
          <tr>
            <td>{{name}}</td>
            <td class="qty-col">{{quantity}}</td>
            <td class="amount-col">{{total}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>

     <div class="total">
        <div class="bilingual">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span><strong>Qty</strong> <span style="color: #666;">(إجمالي الكمية)</span></span>
          </div>
          <div style="text-align: right; font-weight: bold;">{{totalQty}}</div>
        </div>
         <div class="bilingual">
           <div style="display: flex; justify-content: space-between; align-items: center;">
             <span><strong>Subtotal</strong> <span style="color: #666;">(المجموع الفرعي)</span></span>
           </div>
           <div style="text-align: right; font-weight: bold;">{{subtotal}}</div>
         </div>
         <div class="bilingual">
           <div style="display: flex; justify-content: space-between; align-items: center;">
             <span><strong>VAT ({{vatRate}}%)</strong> <span style="color: #666;">(ضريبة)</span></span>
           </div>
           <div style="text-align: right; font-weight: bold;">{{vatAmount}}</div>
         </div>
 <div class="bilingual total-amount">
           <div style="display: flex; justify-content: space-between; align-items: center;">
             <span><strong>TOTAL</strong> <span style="color: #666;">(المبلغ الإجمالي)</span></span>
           </div>
           <div style="text-align: right; font-weight: bold; font-size: 16px;">{{total}}</div>
         </div>
     </div>

    {{#payments}}
    <div style="margin-top: 15px;">
      <table style="width: 100%; border-collapse: collapse;">
         <thead>
           <tr>
              <th style="text-align: right; border-bottom: 1px solid #000; padding: 2px 10px;">
                <strong>Payment</strong><br><span style="color: #666; font-size: 11px;">(نوع الدفع)</span>
              </th>
              <th style="text-align: right; border-bottom: 1px solid #000; padding: 2px 10px;">
                <strong>Amount</strong><br><span style="color: #666; font-size: 11px;">(المبلغ)</span>
              </th>
           </tr>
         </thead>
        <tbody>
          {{#each payments}}
          <tr>
            <td style="padding: 2px 10px;">{{paymentType}}</td>
            <td style="text-align: right; padding: 2px 10px;">{{amount}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
    {{/payments}}

    {{#customFooter}}
    <div class="custom-footer">
    <hr>

      {{customFooter}}
         <hr>
    </div>
    {{/customFooter}}

     <div class="footer">
       {{#includeQR}}
      <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000;">
        <div style="display: inline-block; padding: 5px; background: white; border: 1px solid #ddd;">
          <img src="{{qrCodeUrl}}" alt="رمز QR متوافق مع زاتكا" style="width: 110px; height: 110px;" />
        </div>
      </div>
         <p style="font-size: 0.75rem; color: #666; margin-bottom: 5px;">Powered by Dijitize.com</p>

      {{/includeQR}}
    </div>

  </body>
  </html>`;
