export const defaultArabicReceiptTemplate = `<!DOCTYPE html>
<html dir="ltr">
<head>
  <meta charset="utf-8">
  <title>إيصال</title>
    <style>
     :root {
       --heading-font: {{headingFont}};
       --body-font: {{bodyFont}};
       --line-spacing: {{lineSpacing}};
     }
      body { font-family: var(--body-font), 'Amiri', serif; font-size: 12px; line-height: var(--line-spacing); }
    .header { text-align: center; margin-bottom: 10px; }
    .header h2 { font-family: var(--heading-font), 'Amiri', serif; }
    .custom-header { text-align: center; margin-bottom: 10px; font-weight: bold; font-family: var(--heading-font), 'Amiri', serif; }
    .content { margin-bottom: 10px; }
    .footer { text-align: center; margin-top: 10px; }
    .custom-footer { text-align: center; margin-bottom: 10px; font-style: italic; font-family: var(--heading-font), 'Amiri', serif; }
    .line { display: flex; justify-content: space-between; }
    .total { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; margin-top: 10px; text-align: left; }
    .total-amount { font-weight: bold; font-size: 14px; border-top: 2px solid #000; padding-top: 5px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; table-layout: fixed; }
    th, td { text-align: left; padding: 2px 10px; }
    th { font-weight: bold; border-bottom: 1px solid #000; font-family: var(--heading-font), 'Amiri', serif; }
    .amount-col { text-align: left; width: 70px; }
    .qty-col { text-align: center; width: 50px; }
    .item-col { width: auto; flex: 1; }
    .bilingual { margin-bottom: 2px; text-align: left; }
     .english { text-align: center; direction: ltr; margin-bottom: 1px; }
    .arabic { text-align: left; direction: ltr; }
  </style>
</head>
<body>


     <div class="header">
       {{#companyLogo}}
       <div style="text-align: center; margin-bottom: 10px;">
           <img src="{{companyLogo}}" alt="شعار الشركة" style="max-width: 95%; max-height: 130px; padding: 2%; margin: auto;" />
       </div>
       {{/companyLogo}}
        <div style="text-align: center; margin-bottom: 10px;">
          <div class="english"><h2>{{companyName}}</h2></div>
          {{#companyNameAr}}
          <div class="arabic" style="text-align: center;"><h2>{{companyNameAr}}</h2></div>
          {{/companyNameAr}}
        </div>
       <div class="bilingual">
         <p><strong>Address</strong>           <span style="font-weight: bold;">(العنوان)</span>: {{companyAddress}}</p>
       </div>
       <div class="bilingual">
         <p><strong>Tel</strong>           <span style="font-weight: bold;">(الهاتف)</span>: {{companyPhone}}</p>
       </div>
       {{#companyVat}}
       <div class="bilingual">
         <p><strong>VAT Number</strong>           <span style="font-weight: bold;">(الرقم الضريبي)</span>: {{companyVat}}</p>
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
         <p><strong>Order #</strong>           <span style="font-weight: bold;">(طلب #)</span>: {{orderNumber}}</p>
         {{#queueNumber}}<p><strong>Queue #</strong>           <span style="font-weight: bold;">(رقم الدور)</span>: {{queueNumber}}</p>{{/queueNumber}}
         <p><strong>Type</strong>           <span style="font-weight: bold;">(النوع)</span>: {{orderType}}</p>
         <p><strong>Date</strong>           <span style="font-weight: bold;">(التاريخ)</span>: {{formattedDate}}</p>
       </div>
       {{#tableName}}
       <div class="bilingual">
         <p><strong>Table</strong>           <span style="font-weight: bold;">(الطاولة)</span>: {{tableName}}</p>
       </div>
       {{/tableName}}
       {{#customerName}}
       <div class="bilingual">
         <p><strong>Customer</strong>           <span style="font-weight: bold;">(العميل)</span>: {{customerName}}</p>
       </div>
       {{/customerName}}
       {{#createdByName}}
       <div class="bilingual">
         <p><strong>Served by</strong>           <span style="font-weight: bold;">(خدم من قبل)</span>: {{createdByName}}</p>
       </div>
       {{/createdByName}}
      <hr>
    </div>

    <div class="content">
      <table>
         <thead>
           <tr>
              <th class="item-col">
                <strong>Item</strong><br>                <span style="font-size: 11px; font-weight: bold;">(الصنف)</span>
              </th>
              <th class="qty-col">
                <strong>Qty</strong><br>                <span style="font-size: 11px; font-weight: bold;">(الكمية)</span>
              </th>
              <th class="amount-col">
                <strong>Amount</strong><br><span style="font-size: 11px; font-weight: bold;">(المبلغ)</span>
              </th>
           </tr>
         </thead>
        <tbody>
           {{#each items}}
           <tr>
             <td>{{name}}</td>
             <td class="qty-col">{{quantity}}</td>
             <td class="amount-col">{{lineTotal}}</td>
           </tr>
           {{/each}}
        </tbody>
      </table>
    </div>

     <div class="total">
        <div class="bilingual">
           <div style="display: flex; justify-content: space-between; align-items: center;">
             <span><strong>Qty</strong>              <span style="font-weight: bold;">(إجمالي الكمية)</span></span>
           </div>
          <div style="text-align: right; font-weight: bold;">{{totalQty}}</div>
        </div>
         <div class="bilingual">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span><strong>Subtotal</strong>               <span style="font-weight: bold;">(المجموع الفرعي)</span></span>
            </div>
           <div style="text-align: right; font-weight: bold;">{{subtotal}}</div>
         </div>
         <div class="bilingual">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span><strong>VAT ({{vatRate}}%)</strong>               <span style="font-weight: bold;">(ضريبة)</span></span>
            </div>
           <div style="text-align: right; font-weight: bold;">{{vatAmount}}</div>
         </div>
 <div class="bilingual total-amount">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span><strong>TOTAL</strong>               <span style="font-weight: bold;">(المبلغ الإجمالي)</span></span>
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
                 <strong>Payment</strong><br>                 <span style="font-size: 11px; font-weight: bold;">(نوع الدفع)</span>
               </th>
               <th style="text-align: right; border-bottom: 1px solid #000; padding: 2px 10px;">
                 <strong>Amount</strong><br><span style="font-size: 11px; font-weight: bold;">(المبلغ)</span>
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
           <img src="{{qrCodeUrl}}" alt="رمز QR متوافق مع زاتكا" style="width: 100%; height: auto;" />
         </div>
       </div>
          <p style="font-size: 0.75rem; margin-bottom: 5px;">Powered by Dijitize.com</p>

      {{/includeQR}}
    </div>

  </body>
  </html>`;
