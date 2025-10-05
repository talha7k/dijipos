export const shortInvoiceReportA4 = `<html>
<style>p { margin: 0; } h1, h2, h3, h4, h5, h6 { margin: 0; }</style>
<body style="font-family: sans-serif; margin: 20px;">
    <h1 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px;">{{title}}</h1>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <div style="font-weight: bold; margin-bottom: 10px;">Total Invoices</div>
        <div style="font-size: 24px; font-weight: bold;">{{totalInvoices}}</div>
      </div>
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <div style="font-weight: bold; margin-bottom: 10px;">Total Amount</div>
        <div style="font-size: 24px; font-weight: bold;">{{totalInvoiceAmount}}</div>
      </div>
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <div style="font-weight: bold; margin-bottom: 10px;">Paid Amount</div>
        <div style="font-size: 24px; font-weight: bold; color: #28a745;">{{totalPaidAmount}}</div>
      </div>
      <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
        <div style="font-weight: bold; margin-bottom: 10px;">Unpaid Amount</div>
        <div style="font-size: 24px; font-weight: bold; color: #dc3545;">{{totalUnpaidAmount}}</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
      <div>
        <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;">Payment Status</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead><tr><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Count</th></tr></thead>
          <tbody>
            <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #28a745;">Paid</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{paymentStatus.paid}}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #dc3545;">Unpaid</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{paymentStatus.unpaid}}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #ffc107;">Partially Paid</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{paymentStatus.partiallyPaid}}</td></tr>
            <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #fd7e14;">Overdue</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{paymentStatus.overdue}}</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;">Payment Methods</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead><tr><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Method</th><th style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 8px; text-align: left;">Amount</th></tr></thead>
          <tbody>
            {{#each invoicesByPaymentMethod}}
            <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-transform: capitalize;">{{@key}}</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{this}}</td></tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    </div>

    <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px;">Financial Summary</h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <tbody>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Subtotal (before VAT)</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{totalSubtotal}}</td></tr>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total VAT</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{totalTaxAmount}}</td></tr>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Total Invoice Amount</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right; font-weight: bold;">{{totalInvoiceAmount}}</td></tr>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left;">Average Invoice Value</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right;">{{averageInvoiceValue}}</td></tr>
        <tr><td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #dc3545;">Overdue Amount</td><td style="border: 1px solid #ddd; padding: 8px; text-align: left; text-align: right; color: #dc3545;">{{totalOverdueAmount}}</td></tr>
      </tbody>
    </table>

    <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
        Generated: {{generationTime}} | From: {{fromDate}} | To: {{toDate}}
    </div>
</body>
</html>`;