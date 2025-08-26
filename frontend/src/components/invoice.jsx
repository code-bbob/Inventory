import { useState, useEffect } from "react"
import { format } from "date-fns"
import styled from "styled-components"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import useAxios from "@/utils/useAxios"

// Styled components for A4 invoice print
const InvoiceContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
  background-color: white;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  font-size: 12px;
  line-height: 1.5;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  @media print {
    width: auto;
    max-width: none;
    margin: 0;
    padding: 0 0;
    box-sizing: border-box;
    font-size: 12px;
    line-height: 1.5;
    background-color: #fff !important;
    height: auto !important;
    border: none;
    box-shadow: none;
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
`

const CompanyInfo = styled.div`
  text-align: left;
  margin-bottom: 0;

  h1 {
    font-size: 20px;
    font-weight: bold;
    margin: 0 0 3px 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    word-wrap: break-word;
  }

  p {
    font-size: 12px;
    margin: 1px 0;
    line-height: 1.2;
    word-wrap: break-word;
  }
`

const InvoiceInfo = styled.div`
  text-align: right;
  margin: 0;

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
  grid-template-columns: 6fr 1fr 2fr 2fr;
  gap: 2px;
  border-bottom: 1px solid #e5e7eb;
  padding: 6px 0;
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
  text-align: center;
  
  span:first-child {
    text-align: left;
  }
`

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 6fr 1fr 2fr 2fr;
  gap: 2px;
  padding: 6px 0;
  border-bottom: 1px dotted #ddd;
  font-size: 12px;
  align-items: start;
  
  &:last-child {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 8px;
  }
`

const ItemName = styled.div`
  font-size: 12px;
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
  font-size: 11px;
  color: #666;
  margin-top: 2px;
  line-height: 1.1;
  word-wrap: break-word;
  overflow-wrap: break-word;
`

const ItemCell = styled.div`
  font-size: 12px;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.2;
`

const TotalSection = styled.div`
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e5e7eb;
`

const SubTotal = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 2px 0;
  
  span:last-child {
    font-weight: bold;
  }
`

const TotalAmount = styled.div`
  text-align: right;
  font-size: 14px;
  font-weight: bold;
  margin: 4px 0;
  padding: 2px 0;
  border-top: 1px solid #e5e7eb;
  text-transform: uppercase;
`

const ThankYou = styled.div`
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  border-top: 1px dashed #e5e7eb;
  padding-top: 6px;
  
  p {
    margin: 2px 0;
    font-weight: 600;
    font-size: 12px;
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
        let data = response.data
        // Fallback: if address/contact missing, fetch enterprise info
        if (!data.enterprise_address || !data.enterprise_contact) {
          try {
            const einfo = await api.get('enterprise/info/')
            data = { ...data, ...{
              enterprise_name: data.enterprise_name || einfo.data?.name,
              enterprise_address: data.enterprise_address || einfo.data?.address,
              enterprise_contact: data.enterprise_contact || einfo.data?.contact,
            }}
          } catch {}
        }
        setInvoiceData(data)
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
            size: A4 portrait;
            margin: 12mm;
          }
          html, body {
            width: auto;
            height: auto;
            margin: 0;
            padding: 0;
            background-color: #fff !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          * {
            background: none !important;
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
          <h1>{invoiceData.enterprise_name}</h1>
          <p>{invoiceData.enterprise_address}</p>
          <p>{invoiceData.enterprise_contact}</p>
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
            <ItemCell>{parseFloat(item.unit_price || 0).toFixed(2)}</ItemCell>
            <ItemCell>{parseFloat(item.unit_price || 0).toFixed(2)}</ItemCell>
          </ItemRow>
        ))}
      </ItemsTable>

      <TotalSection>
        <SubTotal>
          <span>Items: {totals.itemCount}</span>
          <span>Subtotal: RS. {totals.subtotal.toFixed ? totals.subtotal.toFixed(2) : totals.subtotal}</span>
        </SubTotal>
        
        {parseFloat(totals.discount) > 0 && (
          <SubTotal>
            <span></span>
            <span>Discount: -RS. {totals.discount.toFixed ? totals.discount.toFixed(2) : totals.discount}</span>
          </SubTotal>
        )}
        
        <TotalAmount>
          Total: RS. {totals.total.toFixed ? totals.total.toFixed(2) : totals.total}
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
