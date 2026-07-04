import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import { CRIME_TYPES_BY_CATEGORY } from "@/lib/constants"
import { Loader2 } from "lucide-react"

export default function Submit() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    category: "property",
    type: "theft_other",
    title: "",
    description: "",
    location: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.reports.create(formData)
      setSuccess(true)
      setTimeout(() => navigate("/"), 2000)
    } catch (err: any) {
      setError(err.message || "Failed to submit report. Make sure you are logged in.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg p-8 text-center space-y-4 bg-card rounded-xl border shadow-sm">
          <h1 className="text-2xl font-bold text-green-500">Report Submitted!</h1>
          <p className="text-muted-foreground">Thank you for your report. Redirecting you home...</p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Report a Crime</h1>
          <p className="text-sm text-muted-foreground">Your report helps keep the community informed and safe.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="name">Full Name</label>
              <input 
                id="name" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="phone">Phone Number</label>
              <input 
                id="phone" 
                required
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="+60..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="title">Report Title</label>
            <input 
              id="title" 
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Brief summary of the incident"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value, type: CRIME_TYPES_BY_CATEGORY[e.target.value][0].value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="assault">Assault</option>
                <option value="property">Property</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="type">Crime Type</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CRIME_TYPES_BY_CATEGORY[formData.category]?.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="location">Location</label>
            <input
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="e.g. Subang Jaya"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="description">Detailed Description</label>
            <textarea 
              id="description" 
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Provide as much detail as possible..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </form>

        <div className="text-center pt-2">
          <Link to="/" className="text-sm text-slate-500 hover:text-primary transition-colors">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
