import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function Submit() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-card rounded-xl border shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Report a Crime</h1>
          <p className="text-sm text-muted-foreground">Your report helps keep the community informed and safe.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="type">Crime Type</label>
            <select 
              id="type" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option>Theft</option>
              <option>Vandalism</option>
              <option>Assault</option>
              <option>Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="description">Description</label>
            <textarea 
              id="description" 
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Provide details about the incident..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="location">Location</label>
            <input 
              id="location" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. 123 Main St"
              type="text" 
            />
          </div>
          <Button className="w-full">Submit Report</Button>
        </div>
        <div className="text-center">
          <Link to="/" className="text-sm text-primary hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
