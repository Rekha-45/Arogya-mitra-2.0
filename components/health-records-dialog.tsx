"use client"

import type React from "react"
import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Plus, Calendar, Tag } from "lucide-react"
import { useUser } from "@/contexts/user-context"

interface HealthRecordsDialogProps {
  children: React.ReactNode
}

export function HealthRecordsDialog({ children }: HealthRecordsDialogProps) {
  const { user, addHealthRecord } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [newRecord, setNewRecord] = useState({
    type: "lab_report" as const,
    title: "",
    description: "",
    tags: "",
  })

  const handleAddRecord = () => {
    if (!newRecord.title) {
      alert("Please enter a record title")
      return
    }

    addHealthRecord({
      date: new Date().toISOString().split("T")[0],
      type: newRecord.type,
      title: newRecord.title,
      description: newRecord.description,
      tags: newRecord.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    })

    alert("Health record added successfully!")
    setNewRecord({ type: "lab_report", title: "", description: "", tags: "" })
  }

  const typeColors: Record<string, string> = {
    lab_report: "bg-blue-100 text-blue-700",
    xray: "bg-purple-100 text-purple-700",
    scan: "bg-pink-100 text-pink-700",
    prescription: "bg-green-100 text-green-700",
    notes: "bg-yellow-100 text-yellow-700",
  }

  const typeLabels: Record<string, string> = {
    lab_report: "Lab Report",
    xray: "X-Ray",
    scan: "Scan",
    prescription: "Prescription",
    notes: "Medical Notes",
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <FileText className="w-5 h-5" />
            Digital Health Records
          </DialogTitle>
          <DialogDescription>Store and organize your medical documents and health records</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Record Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add New Record</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recordType">Record Type</Label>
                <Select value={newRecord.type} onValueChange={(v) => setNewRecord((p) => ({ ...p, type: v as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab_report">Lab Report</SelectItem>
                    <SelectItem value="xray">X-Ray</SelectItem>
                    <SelectItem value="scan">Scan (CT, MRI, Ultrasound)</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="notes">Medical Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordTitle">Title</Label>
                <Input
                  id="recordTitle"
                  value={newRecord.title}
                  onChange={(e) => setNewRecord((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., Blood Test Results - January 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordDescription">Description</Label>
                <Textarea
                  id="recordDescription"
                  value={newRecord.description}
                  onChange={(e) => setNewRecord((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Add relevant notes or details about this record"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordTags">Tags (comma separated)</Label>
                <Input
                  id="recordTags"
                  value={newRecord.tags}
                  onChange={(e) => setNewRecord((p) => ({ ...p, tags: e.target.value }))}
                  placeholder="e.g., blood_work, annual_checkup, diabetes"
                />
              </div>

              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50 cursor-pointer hover:bg-blue-100 transition">
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="font-medium text-gray-700">Click to upload file</p>
                <p className="text-sm text-gray-600">PDF, JPG, PNG up to 10MB</p>
              </div>

              <Button onClick={handleAddRecord} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </CardContent>
          </Card>

          {/* Records List */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Your Records ({(user?.healthRecords || []).length})
            </h3>

            {(user?.healthRecords || []).length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-500">No health records yet</p>
                </CardContent>
              </Card>
            ) : (
              (user?.healthRecords || [])
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record) => (
                  <Card key={record.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {record.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {new Date(record.date).toLocaleDateString()} •{" "}
                            <Badge className={typeColors[record.type]} variant="secondary">
                              {typeLabels[record.type]}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    {record.description && (
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-700">{record.description}</p>
                        {record.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {record.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="w-2 h-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
