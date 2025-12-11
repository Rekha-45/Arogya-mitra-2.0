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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Droplet, Heart, ClipboardList, TrendingUp, Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useUser } from "@/contexts/user-context"

const SYMPTOMS = [
  "Cramps",
  "Bloating",
  "Fatigue",
  "Headache",
  "Mood Swings",
  "Acne",
  "Breast Tenderness",
  "Back Pain",
  "Nausea",
]
const MOODS = ["Happy", "Sad", "Anxious", "Irritable", "Energetic", "Calm", "Stressed", "Focused"]

export function MenstrualCycleTrackerDialog({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedSymptom, setSelectedSymptom] = useState("")
  const [symptomIntensity, setSymptomIntensity] = useState<"mild" | "moderate" | "severe">("mild")
  const [selectedMood, setSelectedMood] = useState("")
  const [moodIntensity, setMoodIntensity] = useState(5)
  const [note, setNote] = useState("")

  if (!user) return <>{children}</>

  const cycleData = user?.menstrualCycle || {
    lastPeriodStart: new Date().toISOString().split("T")[0],
    cycleLength: 28,
    periodDuration: 5,
    symptoms: [],
    mood: [],
    notes: [],
  }

  const lastPeriod = new Date(cycleData.lastPeriodStart)
  const nextPeriod = new Date(lastPeriod)
  nextPeriod.setDate(nextPeriod.getDate() + cycleData.cycleLength)

  const today = new Date()
  const daysInCycle =
    Math.floor((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)) % cycleData.cycleLength

  const getCyclePhase = () => {
    const daysIntoPhase = daysInCycle % cycleData.cycleLength
    if (daysIntoPhase < cycleData.periodDuration) return "Menstruation"
    if (daysIntoPhase < cycleData.periodDuration + 7) return "Follicular"
    if (daysIntoPhase < cycleData.periodDuration + 14) return "Ovulation"
    return "Luteal"
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "Menstruation":
        return "bg-red-100 text-red-700 border-red-200"
      case "Follicular":
        return "bg-cyan-100 text-cyan-700 border-cyan-200"
      case "Ovulation":
        return "bg-pink-100 text-pink-700 border-pink-200"
      case "Luteal":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isPeriodDay = (day: number) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const periodStart = new Date(lastPeriod)
    const periodEnd = new Date(lastPeriod)
    periodEnd.setDate(periodEnd.getDate() + cycleData.periodDuration - 1)

    return checkDate >= periodStart && checkDate <= periodEnd
  }

  const markPeriodDay = (day: number) => {
    const markDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const updatedCycle = {
      ...cycleData,
      lastPeriodStart: markDate.toISOString().split("T")[0],
    }
    updateUser({ menstrualCycle: updatedCycle })
  }

  const handleAddSymptom = () => {
    if (!selectedSymptom) return

    const updatedCycle = {
      ...cycleData,
      symptoms: [
        ...cycleData.symptoms,
        {
          date: selectedDate,
          symptom: selectedSymptom,
          intensity: symptomIntensity,
        },
      ],
    }
    updateUser({ menstrualCycle: updatedCycle })
    setSelectedSymptom("")
    setSymptomIntensity("mild")
  }

  const handleAddMood = () => {
    if (!selectedMood) return

    const updatedCycle = {
      ...cycleData,
      mood: [
        ...cycleData.mood,
        {
          date: selectedDate,
          mood: selectedMood,
          intensity: moodIntensity,
        },
      ],
    }
    updateUser({ menstrualCycle: updatedCycle })
    setSelectedMood("")
    setMoodIntensity(5)
  }

  const handleAddNote = () => {
    if (!note.trim()) return

    const updatedCycle = {
      ...cycleData,
      notes: [
        ...cycleData.notes,
        {
          date: selectedDate,
          note,
        },
      ],
    }
    updateUser({ menstrualCycle: updatedCycle })
    setNote("")
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600">
            <Droplet className="w-5 h-5" />
            Menstrual Cycle Tracker
          </DialogTitle>
          <DialogDescription>Track your cycle, symptoms, mood, and health patterns</DialogDescription>
        </DialogHeader>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className="flex-1"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === "calendar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("calendar")}
            className="flex-1"
          >
            Calendar
          </Button>
          <Button
            variant={activeTab === "log" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("log")}
            className="flex-1"
          >
            Log Data
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
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Cycle Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600">Current Phase</p>
                    <p className={`text-sm font-bold mt-1 ${getPhaseColor(getCyclePhase()).split(" ")[0]}`}>
                      {getCyclePhase()}
                    </p>
                    <Badge className={`mt-2 ${getPhaseColor(getCyclePhase())}`}>{daysInCycle} days in</Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600">Last Period</p>
                    <p className="text-sm font-bold mt-1">{new Date(cycleData.lastPeriodStart).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Cycle: {cycleData.cycleLength}d</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600">Next Period</p>
                    <p className="text-sm font-bold mt-1">{nextPeriod.toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days away
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-600">Period Length</p>
                    <p className="text-sm font-bold mt-1">{cycleData.periodDuration} days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Phase Guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cycle Phases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Menstruation (Day 1-5)</p>
                      <p className="text-xs text-gray-600">Shedding of uterine lining</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Follicular (Day 6-12)</p>
                      <p className="text-xs text-gray-600">Rising estrogen, follicle growth</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Ovulation (Day 13-14)</p>
                      <p className="text-xs text-gray-600">Fertile window, egg release</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Luteal (Day 15-28)</p>
                      <p className="text-xs text-gray-600">Progesterone rise, premenstrual phase</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "calendar" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Mark Your Period
                </CardTitle>
                <CardDescription>Click on days to mark as period days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="text-lg font-semibold">
                    {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`}></div>
                  ))}
                  {calendarDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => markPeriodDay(day)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        isPeriodDay(day)
                          ? "bg-rose-500 text-white border-2 border-rose-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-sm text-rose-900">
                    <strong>Tip:</strong> Click on a day to mark it as the start of your period. This will recalculate
                    your cycle phases.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "log" && (
            <div className="space-y-6">
              {/* Log Symptoms */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Log Symptoms
                  </CardTitle>
                  <CardDescription>Track how you're feeling today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date" className="text-sm">
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="symptom" className="text-sm">
                        Symptom
                      </Label>
                      <Select value={selectedSymptom} onValueChange={setSelectedSymptom}>
                        <SelectTrigger id="symptom" className="mt-1">
                          <SelectValue placeholder="Select symptom" />
                        </SelectTrigger>
                        <SelectContent>
                          {SYMPTOMS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="intensity" className="text-sm">
                        Intensity
                      </Label>
                      <Select value={symptomIntensity} onValueChange={(v) => setSymptomIntensity(v as any)}>
                        <SelectTrigger id="intensity" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleAddSymptom} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Symptom
                  </Button>
                </CardContent>
              </Card>

              {/* Log Mood */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Log Mood
                  </CardTitle>
                  <CardDescription>How are you feeling emotionally?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="moodDate" className="text-sm">
                        Date
                      </Label>
                      <Input
                        id="moodDate"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="mood" className="text-sm">
                        Mood
                      </Label>
                      <Select value={selectedMood} onValueChange={setSelectedMood}>
                        <SelectTrigger id="mood" className="mt-1">
                          <SelectValue placeholder="Select mood" />
                        </SelectTrigger>
                        <SelectContent>
                          {MOODS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">
                      Intensity: <span className="font-bold text-rose-600">{moodIntensity}/10</span>
                    </Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={moodIntensity}
                      onChange={(e) => setMoodIntensity(Number.parseInt(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>

                  <Button onClick={handleAddMood} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Mood
                  </Button>
                </CardContent>
              </Card>

              {/* Add Note */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Add Note
                  </CardTitle>
                  <CardDescription>Any additional observations?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="noteDate" className="text-sm">
                      Date
                    </Label>
                    <Input
                      id="noteDate"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="note" className="text-sm">
                      Note
                    </Label>
                    <Textarea
                      id="note"
                      placeholder="Add any notes about your cycle..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="mt-1 min-h-20"
                    />
                  </div>

                  <Button onClick={handleAddNote} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              {/* Recent Symptoms */}
              {cycleData.symptoms.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Symptoms</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {cycleData.symptoms.slice(-5).map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{s.symptom}</p>
                          <p className="text-xs text-gray-600">{new Date(s.date).toLocaleDateString()}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            s.intensity === "severe"
                              ? "bg-red-100 text-red-700"
                              : s.intensity === "moderate"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {s.intensity}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recent Moods */}
              {cycleData.mood.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Moods</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {cycleData.mood.slice(-5).map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{m.mood}</p>
                          <p className="text-xs text-gray-600">{new Date(m.date).toLocaleDateString()}</p>
                        </div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${(m.intensity / 10) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recent Notes */}
              {cycleData.notes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {cycleData.notes.slice(-5).map((n, idx) => (
                      <div key={idx} className="text-sm p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{n.note}</p>
                        <p className="text-xs text-gray-600 mt-1">{new Date(n.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {cycleData.symptoms.length === 0 && cycleData.mood.length === 0 && cycleData.notes.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">No tracking data yet. Start logging your symptoms and mood!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
