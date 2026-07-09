import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { CRIME_TYPES_BY_CATEGORY } from "@/lib/constants";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Submit() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    ic_number: "",
    email: "",
    category: "property",
    type: "theft_other",
    title: "",
    incident_date: "",
    incident_time: "",
    description: "",
    location: "",
  });

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCategory = e.target.value;
    // Safely pull the first sub-type fallback for the newly selected category
    const defaultType = CRIME_TYPES_BY_CATEGORY[nextCategory]?.[0]?.value || "";

    setFormData((prev) => ({
      ...prev,
      category: nextCategory,
      type: defaultType,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.reports.create(formData);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError(
        err.message || "Failed to submit report. Make sure you are logged in.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-xl p-12 text-center space-y-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Report Submitted!
          </h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your report. Redirecting you home...
          </p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-green-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 md:p-12 bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl space-y-8 bg-white dark:bg-slate-900 p-8 md:p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Header Block */}
        <div className="space-y-2 text-center max-w-md mx-auto">
          <h1 className="text-3xl font-bold tracking-tight">Report a Crime</h1>
          <p className="text-sm text-muted-foreground">
            Your report helps keep the community informed and safe.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="relative max-w-md mx-auto py-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300 z-0"
            style={{ width: step === 1 ? "0%" : "100%" }}
          />

          <div className="relative flex justify-between z-10">
            {/* Step 1 Node */}
            <div className="flex flex-col items-center bg-white dark:bg-slate-900 px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-semibold transition-colors duration-300 ${
                  step >= 1
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                1
              </div>
              <span className="text-xs font-medium mt-2 text-slate-600 dark:text-slate-400">
                Reporter Info
              </span>
            </div>

            {/* Step 2 Node */}
            <div className="flex flex-col items-center bg-white dark:bg-slate-900 px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-semibold transition-colors duration-300 ${
                  step === 2
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-white dark:bg-slate-900 border-slate-300 text-slate-400"
                }`}
              >
                2
              </div>
              <span className="text-xs font-medium mt-2 text-slate-600 dark:text-slate-400">
                Incident Details
              </span>
            </div>
          </div>
        </div>

        {/* Form Error Message */}
        {error && (
          <div className="p-4 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        {/* STEP 1 FORM (Reporter Details) */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="ic_number"
                >
                  IC / Passport Number
                </label>
                <input
                  id="ic_number"
                  required
                  value={formData.ic_number}
                  onChange={(e) =>
                    setFormData({ ...formData, ic_number: e.target.value })
                  }
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. 980102-14-5566"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="phone"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  required
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="+60..."
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="e.g. johndoe@example.com"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="submit" className="px-6 gap-2">
                Next Step <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2 FORM (Incident Details) */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="ic_number">IC Number</label>
              <input
                id="ic_number"
                required
                value={formData.ic_number}
                onChange={(e) => setFormData({...formData, ic_number: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="e.g. 901231-01-1234"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Brief summary of the incident"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="category"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="assault">Assault</option>
                  <option value="property">Property</option>
                </select>
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="type"
                >
                  Crime Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {CRIME_TYPES_BY_CATEGORY[formData.category]?.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="incident_date"
                >
                  Date of Incident
                </label>
                <input
                  id="incident_date"
                  type="date"
                  required
                  value={formData.incident_date}
                  onChange={(e) =>
                    setFormData({ ...formData, incident_date: e.target.value })
                  }
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="incident_time"
                >
                  Time of Incident
                </label>
                <input
                  id="incident_time"
                  type="time"
                  required
                  value={formData.incident_time}
                  onChange={(e) =>
                    setFormData({ ...formData, incident_time: e.target.value })
                  }
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none"
                htmlFor="location"
              >
                Location
              </label>
              <input
                id="location"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="e.g. Subang Jaya"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none"
                htmlFor="description"
              >
                Detailed Description
              </label>
              <textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Provide as much detail as possible..."
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="gap-2"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button type="submit" className="px-6 gap-2" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
