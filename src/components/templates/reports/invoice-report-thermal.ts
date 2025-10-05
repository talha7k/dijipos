export const invoiceReportThermal = `<html>
<style>p { margin: 0; } h1, h2, h3, h4, h5, h6 { margin: 0; }</style>
<body style="font-family: monospace; margin: 5px; font-size: 12px;">
    <div style="text-align: center; margin-bottom: 15px;">
        <h1 style="font-size: 16px; margin: 0 0 5px 0;">{{title}}</h1>
    </div>

    <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Total Invoices:</span>
            <span>{{totalInvoices}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Total Amount:</span>
            <span>{{totalInvoiceAmount}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Paid:</span>
            <span>{{totalPaidAmount}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Unpaid:</span>
            <span>{{totalUnpaidAmount}}</span>
        </div>
    </div>

    {{#if isDetailed}}
    <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0;">
        <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">PAYMENT STATUS</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>Paid:</span>
            <span>{{paymentStatus.paid}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>Unpaid:</span>
            <span>{{paymentStatus.unpaid}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>Partial:</span>
            <span>{{paymentStatus.partiallyPaid}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>Overdue:</span>
            <span>{{paymentStatus.overdue}}</span>
        </div>
    </div>

    <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0;">
        <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">AGING REPORT</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>Current:</span>
            <span>{{agingReport.current}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>1-30 Days:</span>
            <span>{{agingReport.days1_30}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>31-60 Days:</span>
            <span>{{agingReport.days31_60}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>61-90 Days:</span>
            <span>{{agingReport.days61_90}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>Over 90:</span>
            <span>{{agingReport.over90}}</span>
        </div>
    </div>

    <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0;">
        <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">TOP CUSTOMERS</div>
        {{#each topCustomers}}
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span style="max-width: 60%; overflow: hidden; text-overflow: ellipsis;">{{this.name}}</span>
            <span>{{this.invoiceCount}}/{{this.totalAmount}}</span>
        </div>
        {{/each}}
    </div>

    <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0;">
        <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">TOP ITEMS</div>
        {{#each topSellingItems}}
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span style="max-width: 60%; overflow: hidden; text-overflow: ellipsis;">{{this.name}}</span>
            <span>{{this.quantity}}/{{this.total}}</span>
        </div>
        {{/each}}
    </div>

    <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0;">
        <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">PAYMENT METHODS</div>
        {{#each invoicesByPaymentMethod}}
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span style="text-transform: capitalize;">{{@key}}</span>
            <span>{{this}}</span>
        </div>
        {{/each}}
    </div>
    {{/if}}

    <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0;">
        <div style="font-weight: bold; text-align: center; margin-bottom: 5px;">FINANCIAL SUMMARY</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>Subtotal:</span>
            <span>{{totalSubtotal}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>VAT:</span>
            <span>{{totalTaxAmount}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>Total:</span>
            <span>{{totalInvoiceAmount}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>Average:</span>
            <span>{{averageInvoiceValue}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px;">
            <span>Overdue:</span>
            <span>{{totalOverdueAmount}}</span>
        </div>
    </div>

    <div style="text-align: center; margin-top: 15px; font-size: 10px; border-top: 1px dashed #000; padding-top: 5px;">
        <div>{{generationTime}}</div>
        <div>{{fromDate}} - {{toDate}}</div>
    </div>
</body>
</html>`;