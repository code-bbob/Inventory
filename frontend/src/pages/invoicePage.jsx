import { useParams } from "react-router-dom"
import Invoice from "../components/invoice"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const InvoicePage = () => {
  const { transactionId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen py-8 print:bg-white">
      <Button
        onClick={() => navigate("/mobile")}
        variant="outline"
        className="w-full lg:w-auto px-5 mb-4 text-white print:hidden hover:bg-slate-700 hover:text-white mx-4"
      >
        <ArrowLeft className="mr-2 h-4 w-3" />
        Back to Mobile Dashboard
      </Button>
      <Invoice transactionId={transactionId} />
    </div>
  )
}

export default InvoicePage
