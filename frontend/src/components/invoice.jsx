import { useState, useEffect } from "react"
import { format } from "date-fns"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import useAxios from "@/utils/useAxios"

// Styled components for invoice print - mirror AllInvoice formatting
const InvoiceContainer = styled.div`
  width: 80mm;
  margin: 0 auto;
  margin-top: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: white;
  font-family: 'Courier New', monospace;
  font-size: 20px;
  line-height: 1.3;

  @media print {
    width: 80mm;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-size: 20px;
    line-height: 1.3;
    background-color: #fff !important;
    height: 100% !important;
  }

  @media screen {
    /* preview styling removed for invoice */
  }

  hr {
    border: none;
    border-top: 1px dashed #000;
    margin: 4px 0;
  }
`

const InvoiceHeader = styled.div`
  text-align: center;
  margin-bottom: 8px;
  border-bottom: 1px dashed #000;
  padding-bottom: 6px;
`

const CompanyInfo = styled.div`
  text-align: center;
  margin-bottom: 6px;

  h1 {
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 3px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    word-wrap: break-word;
  }

  p {
    font-size: 14px;
    margin: 1px 0;
    line-height: 1.2;
    word-wrap: break-word;
  }
`

const InvoiceInfo = styled.div`
  text-align: right;
  margin: 4px 0;

  p {
    font-size: 12px;
    margin: 2px 0;
    line-height: 1.2;
  }
`

const BillTo = styled.div`
  margin-bottom: 8px;
  border-bottom: 1px dashed #000;
  padding-bottom: 6px;

  h3 {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 3px 0;
    text-transform: uppercase;
  }

  p {
    font-size: 13px;
    margin: 1px 0;
    line-height: 1.2;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    max-width: 100%;
  }
`

const ItemsTable = styled.div`
  margin-bottom: 8px;
  width: 100%;
`

const ItemsHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2px;
  border-bottom: 1px solid #000;
  padding: 3px 0;
  font-weight: bold;
  font-size: 16px;
  text-transform: uppercase;
  text-align: center;
  
  span:first-child {
    text-align: left;
  }
`

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2px;
  padding: 3px 0;
  border-bottom: 1px dotted #ccc;
  font-size: 16px;
  align-items: start;
  
  &:last-child {
    border-bottom: 1px dashed #000;
    padding-bottom: 6px;
  }
`

const ItemName = styled.div`
  font-size: 16px;
  font-weight: bold;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  line-height: 1.2;
  white-space: normal;
  text-align: left;
  padding-right: 2px;
`

const ItemIMEI = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 2px;
  line-height: 1.1;
  word-wrap: break-word;
  overflow-wrap: break-word;
`

const ItemCell = styled.div`
  font-size: 16px;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.2;
`

const TotalSection = styled.div`
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #000;
`

const SubTotal = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 17px;
  margin: 2px 0;
  
  span:last-child {
    font-weight: bold;
  }
`

const TotalAmount = styled.div`
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  margin: 4px 0;
  padding: 2px 0;
  border-top: 1px solid #000;
  text-transform: uppercase;
`

const ThankYou = styled.div`
  margin-top: 8px;
  text-align: center;
  font-size: 17px;
  border-top: 1px dashed #000;
  padding-top: 6px;
  
  p {
    margin: 2px 0;
    font-weight: bold;
    font-size: 17px;
  }
`

const PrintButton = styled(Button)`
  margin-top: 16px;
  width: 100%;
  font-size: 12px;

  @media print {
    display: none;
  }
`

// Main component
const Invoice = ({ transactionId }) => {
  const [invoiceData, setInvoiceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const api = useAxios()

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await api.get(`transaction/salestransaction/${transactionId}/`)
        setInvoiceData(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to fetch invoice data")
        setLoading(false)
      }
    }

    fetchInvoiceData()
  }, [transactionId])

  const handlePrint = () => {
    const printStyles = `
      <style>
        @media print {
          @page {
            size: 80mm 210mm;
            margin: 0;
          }
          html, body {
            width: 80mm;
            height: 210mm;
            margin: 0;
            padding: 0;
            background-color: #fff !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          * {
            background: none !important;
            background-color: #fff !important;
            color: #000 !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .no-break {
            page-break-inside: avoid !important;
          }
        }
      </style>
    `;
    
    const head = document.head || document.getElementsByTagName('head')[0];
    const styleElement = document.createElement('style');
    styleElement.innerHTML = printStyles;
    head.appendChild(styleElement);
    
    // Small delay to ensure styles are applied
    setTimeout(() => {
      window.print();
      
      // Clean up after print
      setTimeout(() => {
        head.removeChild(styleElement);
      }, 1000);
    }, 100);
  }

  // Calculate totals for better display
  const calculateTotals = () => {
    const items = invoiceData.sales || [];
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.unit_price || 0), 0);
    const totalDiscount = parseFloat(invoiceData.discount || 0);
    return {
      itemCount: items.length,
      subtotal: subtotal,
      discount: totalDiscount,
      total: parseFloat(invoiceData.total_amount || 0)
    };
  }

  if (loading) return <div style={{textAlign: 'center', padding: '20px', fontFamily: 'monospace'}}>Loading invoice...</div>
  if (error) return <div style={{textAlign: 'center', padding: '20px', color: 'red', fontFamily: 'monospace'}}>{error}</div>
  if (!invoiceData) return null

  const totals = calculateTotals();

  return (
    <InvoiceContainer className="no-break">
      <InvoiceHeader>
        <CompanyInfo>
          <h1>Digitech Enterprises</h1>
          <p>Basundhara -03, Kathmandu</p>
          <p>Phone: (+977) 9851193055</p>
        </CompanyInfo>
        
        <InvoiceInfo>
          <p>Bill No: {invoiceData.bill_no || 'N/A'}</p>
          <p>Date: {format(new Date(invoiceData.date), "dd/MM/yyyy")}</p>
        </InvoiceInfo>
      </InvoiceHeader>

      <ItemsTable>
        <ItemsHeader>
          <span>Item</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Amt</span>
        </ItemsHeader>
        
        {(invoiceData.sales || []).map((item, index) => (
          <ItemRow key={item.id || index}>
            <div>
              <ItemName>
                {item.phone_name || 'Unknown Item'}
              </ItemName>
              {item.imei_number && (
                <ItemIMEI>
                  IMEI: {item.imei_number}
                </ItemIMEI>
              )}
            </div>
            <ItemCell>1</ItemCell>
            <ItemCell>{(item.unit_price )}</ItemCell>
            <ItemCell>{(item.unit_price)}</ItemCell>
          </ItemRow>
        ))}
      </ItemsTable>

      <TotalSection>
        <SubTotal>
          <span>Items: {totals.itemCount}</span>
          <span>Subtotal: RS. {totals.subtotal}</span>
        </SubTotal>
        
        {parseFloat(totals.discount) > 0 && (
          <SubTotal>
            <span></span>
            <span>Discount: -RS. {totals.discount}</span>
          </SubTotal>
        )}
        
        <TotalAmount>
          Total: RS. {totals.total}
        </TotalAmount>
      </TotalSection>

      <ThankYou>
        <p>*** THANK YOU ***</p>
      </ThankYou>

      <PrintButton onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print Receipt
      </PrintButton>
    </InvoiceContainer>
  )
}

export default Invoice
