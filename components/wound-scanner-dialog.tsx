"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Camera, CheckCircle, AlertTriangle } from "lucide-react"
import { useUser } from "@/contexts/user-context"

interface WoundScannerDialogProps {
  children: React.ReactNode
}

export function WoundScannerDialog({ children }: WoundScannerDialogProps) {
  const { user, addWoundRecord } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("scan")
  const [woundImage, setWoundImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [woundData, setWoundData] = useState({
    type: "",
    severity: "minor" as const,
    location: "",
    description: "",
  })
  const [aiAnalysis, setAiAnalysis] = useState<{
    severity: string
    suggestions: string[]
    warning?: string
  } | null>(null)

  const getFirstAidSuggestions = (type: string, severity: string) => {
    const suggestions: Record<string, Record<string, string[]>> = {
      cut: {
        minor: ["Wash with soap and water", "Apply pressure if bleeding", "Apply bandage", "Monitor for infection"],
        moderate: [
          "Apply direct pressure to stop bleeding",
          "Rinse with clean water",
          "Apply antibiotic ointment",
          "Seek medical attention if bleeding continues",
        ],
        severe: [
          "Call emergency services immediately",
          "Apply firm direct pressure with clean cloth",
          "Elevate the wound",
          "Do not remove embedded objects",
        ],
      },
      burn: {
        minor: ["Cool with running water for 15 minutes", "Apply burn gel or aloe vera", "Cover loosely with gauze"],
        moderate: [
          "Cool with running water for 20 minutes",
          "Do not apply ice directly",
          "Cover with sterile bandage",
          "Take over-the-counter pain reliever",
        ],
        severe: ["Call 911 immediately", "Do not remove clothing if stuck to burn", "Cover with clean cloth"],
      },
      wound: {
        minor: ["Wash and dry the wound", "Apply antibiotic ointment", "Cover with sterile bandage"],
        moderate: [
          "Clean the wound",
          "Apply pressure to stop bleeding",
          "Consider stitches if deep",
          "Apply antibiotic ointment",
        ],
        severe: ["Seek immediate medical attention", "Do not touch the wound", "Cover with clean cloth"],
      },
    }
    return suggestions[type]?.[severity] || ["Consult with healthcare provider"]
  }

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setWoundImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyzeWound = () => {
    if (!woundData.type || !woundData.location) {
      alert("Please fill in wound type and location")
      return
    }

    const suggestions = getFirstAidSuggestions(woundData.type, woundData.severity)
    setAiAnalysis({
      severity: woundData.severity,
      suggestions,
      warning:
        woundData.severity === "severe"
          ? "This wound requires immediate professional medical attention. Please seek emergency care."
          : undefined,
    })
  }

  const handleSaveRecord = () => {
    if (aiAnalysis) {
      addWoundRecord({
        date: new Date().toISOString().split("T")[0],
        image: woundImage || undefined,
        type: woundData.type,
        severity: woundData.severity,
        location: woundData.location,
        description: woundData.description,
        firstAidSuggestions: aiAnalysis.suggestions.join("\n"),
        status: "open",
        notes: "",
      })
      alert("Wound record saved successfully!")
      setIsOpen(false)
      setWoundImage(null)
      setWoundData({ type: "", severity: "minor", location: "", description: "" })
      setAiAnalysis(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Camera className="w-5 h-5" />
            Wound Scanner & AI Assistant
          </DialogTitle>
          <DialogDescription>Scan and analyze wounds with AI-powered first aid suggestions</DialogDescription>
        </DialogHeader>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === "scan" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("scan")}
            className="flex-1"
          >
            Scan Wound
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("history")}
            className="flex-1"
          >
            History
          </Button>
        </div>

        <div className="space-y-6">
          {activeTab === "scan" && (
            <div className="space-y-6">
              {/* Image Capture */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Capture Wound Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center bg-orange-50 cursor-pointer hover:bg-orange-100 transition"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {woundImage ? (
                      <img
                        src={woundImage || "/placeholder.svg"}
                        alt="Wound preview"
                        className="max-h-64 mx-auto rounded"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="w-8 h-8 text-orange-500 mx-auto" />
                        <p className="font-medium text-gray-700">Click to capture or upload wound image</p>
                        <p className="text-sm text-gray-600">JPEG, PNG up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageCapture}
                  />
                  {woundImage && (
                    <Button variant="outline" onClick={() => setWoundImage(null)} className="w-full">
                      Remove Image
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Wound Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Wound Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="woundType">Wound Type</Label>
                      <Select value={woundData.type} onValueChange={(v) => setWoundData((p) => ({ ...p, type: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cut">Cut / Laceration</SelectItem>
                          <SelectItem value="burn">Burn</SelectItem>
                          <SelectItem value="wound">General Wound</SelectItem>
                          <SelectItem value="scrape">Scrape / Abrasion</SelectItem>
                          <SelectItem value="puncture">Puncture Wound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity</Label>
                      <Select
                        value={woundData.severity}
                        onValueChange={(v) => setWoundData((p) => ({ ...p, severity: v as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minor">Minor</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Wound Location</Label>
                    <Input
                      id="location"
                      value={woundData.location}
                      onChange={(e) => setWoundData((p) => ({ ...p, location: e.target.value }))}
                      placeholder="e.g., Left hand, Right knee"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={woundData.description}
                      onChange={(e) => setWoundData((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Describe the wound, how it happened, etc."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleAnalyzeWound} className="w-full bg-orange-600 hover:bg-orange-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Analyze with AI
                  </Button>
                </CardContent>
              </Card>

              {/* AI Analysis Results */}
              {aiAnalysis && (
                <Card className={aiAnalysis.warning ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {aiAnalysis.warning ? (
                        <>
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <span className="text-red-600">Immediate Care Required</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-600">First Aid Recommendations</span>
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiAnalysis.warning && <p className="text-red-700 font-medium">{aiAnalysis.warning}</p>}

                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">Recommended First Aid Steps:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        {aiAnalysis.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-gray-700">
                            {suggestion}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveRecord} className="flex-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save Record
                      </Button>
                      <Button variant="outline" onClick={() => setAiAnalysis(null)} className="flex-1">
                        Revise
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {(user?.woundRecords || []).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No wound records yet</p>
                </div>
              ) : (
                (user?.woundRecords || []).map((wound) => (
                  <Card key={wound.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{wound.type}</CardTitle>
                        <Badge
                          className={
                            wound.severity === "severe"
                              ? "bg-red-100 text-red-700"
                              : wound.severity === "moderate"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                          }
                        >
                          {wound.severity}
                        </Badge>
                      </div>
                      <CardDescription>{new Date(wound.date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Location:</span> {wound.location}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span> {wound.status}
                      </p>
                      {wound.image && (
                        <img src={wound.image || "/placeholder.svg"} alt="Wound" className="max-h-40 rounded" />
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
