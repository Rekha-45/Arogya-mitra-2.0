"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  emergencyContact: string
  medicalConditions: string
  allergies: string
  bloodType: string
  height: string
  weight: string
  language: string
  notifications: boolean
  currentMedications: Array<{
    id: string
    name: string
    dosage: string
    frequency: string
    startDate: string
    endDate?: string
    instructions: string
  }>
  healthGoals: Array<{
    id: string
    type: string
    target: number
    current: number
    unit: string
  }>
  vitalSigns: Array<{
    id: string
    type: string
    value: number
    unit: string
    date: string
    time: string
  }>
  appointments: Array<{
    id: string
    doctorName: string
    specialty: string
    date: string
    time: string
    type: string
    status: string
    notes?: string
  }>
  menstrualCycle?: {
    lastPeriodStart: string
    cycleLength: number
    periodDuration: number
    symptoms: Array<{
      date: string
      symptom: string
      intensity: "mild" | "moderate" | "severe"
    }>
    mood: Array<{
      date: string
      mood: string
      intensity: number
    }>
    notes: Array<{
      date: string
      note: string
    }>
  }
  woundRecords?: Array<{
    id: string
    date: string
    image?: string
    type: string
    severity: "minor" | "moderate" | "severe"
    location: string
    description: string
    firstAidSuggestions: string
    status: "open" | "healing" | "healed"
    notes: string
  }>
  healthRecords?: Array<{
    id: string
    date: string
    type: "lab_report" | "xray" | "scan" | "prescription" | "notes"
    title: string
    description: string
    file?: string
    tags: string[]
  }>
  medicineOrders?: Array<{
    id: string
    date: string
    medicines: Array<{
      name: string
      dosage: string
      quantity: number
      prescriptionId?: string
    }>
    pharmacy?: string
    status: "pending" | "confirmed" | "delivered"
    totalPrice: number
    deliveryDate?: string
  }>
  savedPharmacies?: Array<{
    id: string
    name: string
    address: string
    phone: string
    latitude: number
    longitude: number
    distance: number
    rating: number
  }>
  savedHospitals?: Array<{
    id: string
    name: string
    address: string
    phone: string
    latitude: number
    longitude: number
    distance: number
    emergencyNumber: string
    departments: string[]
  }>
}

interface UserContextType {
  user: UserProfile | null
  updateUser: (updates: Partial<UserProfile>) => void
  addMedication: (medication: UserProfile["currentMedications"][0]) => void
  removeMedication: (medicationId: string) => void
  addVitalSign: (vitalSign: UserProfile["vitalSigns"][0]) => void
  addAppointment: (appointment: UserProfile["appointments"][0]) => void
  updateHealthGoal: (goalId: string, updates: Partial<UserProfile["healthGoals"][0]>) => void
  isLoading: boolean
  addWoundRecord: (record: Omit<UserProfile["woundRecords"][0], "id">) => void
  addHealthRecord: (record: Omit<UserProfile["healthRecords"][0], "id">) => void
  addMedicineOrder: (order: Omit<UserProfile["medicineOrders"][0], "id" | "date">) => void
  updateWoundRecord: (woundId: string, updates: Partial<UserProfile["woundRecords"][0]>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const defaultUser: UserProfile = {
  firstName: "Alex",
  lastName: "Johnson",
  email: "alex.johnson@email.com",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "1990-05-15",
  gender: "male",
  address: "123 Health St, Wellness City, WC 12345",
  emergencyContact: "Jane Johnson - +1 (555) 987-6543",
  medicalConditions: "Hypertension, Type 2 Diabetes",
  allergies: "Penicillin, Shellfish",
  bloodType: "A+",
  height: "5'10\"",
  weight: "175 lbs",
  language: "en",
  notifications: true,
  currentMedications: [
    {
      id: "1",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: "2024-01-15",
      instructions: "Take with food in the morning",
    },
    {
      id: "2",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      startDate: "2024-01-15",
      instructions: "Take with meals",
    },
  ],
  healthGoals: [
    { id: "1", type: "water", target: 8, current: 5, unit: "glasses" },
    { id: "2", type: "steps", target: 10000, current: 7500, unit: "steps" },
    { id: "3", type: "weight", target: 170, current: 175, unit: "lbs" },
  ],
  vitalSigns: [
    { id: "1", type: "blood_pressure", value: 125, unit: "mmHg", date: "2024-01-20", time: "08:00" },
    { id: "2", type: "heart_rate", value: 72, unit: "bpm", date: "2024-01-20", time: "08:00" },
    { id: "3", type: "blood_sugar", value: 110, unit: "mg/dL", date: "2024-01-20", time: "08:00" },
  ],
  appointments: [
    {
      id: "1",
      doctorName: "Dr. Sarah Wilson",
      specialty: "Cardiologist",
      date: "2024-01-25",
      time: "10:00 AM",
      type: "Follow-up",
      status: "scheduled",
    },
  ],
  menstrualCycle: {
    lastPeriodStart: "2024-12-15",
    cycleLength: 28,
    periodDuration: 5,
    symptoms: [
      { date: "2024-12-15", symptom: "Cramps", intensity: "moderate" },
      { date: "2024-12-16", symptom: "Bloating", intensity: "mild" },
      { date: "2024-12-20", symptom: "Fatigue", intensity: "mild" },
    ],
    mood: [
      { date: "2024-12-18", mood: "Anxious", intensity: 7 },
      { date: "2024-12-19", mood: "Happy", intensity: 8 },
      { date: "2024-12-20", mood: "Irritable", intensity: 6 },
    ],
    notes: [
      { date: "2024-12-15", note: "Period started" },
      { date: "2024-12-19", note: "Feeling better" },
    ],
  },
  woundRecords: [],
  healthRecords: [
    {
      id: "1",
      date: "2024-01-15",
      type: "lab_report",
      title: "Blood Test Report",
      description: "Annual health checkup lab results",
      tags: ["blood_work", "checkup"],
    },
  ],
  medicineOrders: [
    {
      id: "1",
      date: "2024-01-10",
      medicines: [
        { name: "Lisinopril", dosage: "10mg", quantity: 30 },
        { name: "Metformin", dosage: "500mg", quantity: 60 },
      ],
      pharmacy: "Care Pharmacy",
      status: "delivered",
      totalPrice: 45.99,
      deliveryDate: "2024-01-12",
    },
  ],
  savedPharmacies: [
    {
      id: "1",
      name: "Care Pharmacy",
      address: "123 Main St, City, ST 12345",
      phone: "+1 (555) 123-4567",
      latitude: 40.7128,
      longitude: -74.006,
      distance: 0.5,
      rating: 4.8,
    },
  ],
  savedHospitals: [
    {
      id: "1",
      name: "City General Hospital",
      address: "456 Hospital Ave, City, ST 12345",
      phone: "+1 (555) 987-6543",
      latitude: 40.758,
      longitude: -73.9855,
      distance: 1.2,
      emergencyNumber: "911",
      departments: ["Emergency", "Cardiology", "Orthopedics"],
    },
  ],
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user data from localStorage
    const savedUser = localStorage.getItem("healthTracker_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Error loading user data:", error)
        setUser(defaultUser)
      }
    } else {
      setUser(defaultUser)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Save user data to localStorage whenever it changes
    if (user && !isLoading) {
      localStorage.setItem("healthTracker_user", JSON.stringify(user))
    }
  }, [user, isLoading])

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null))
  }

  const addMedication = (medication: UserProfile["currentMedications"][0]) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            currentMedications: [...prev.currentMedications, medication],
          }
        : null,
    )
  }

  const removeMedication = (medicationId: string) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            currentMedications: prev.currentMedications.filter((med) => med.id !== medicationId),
          }
        : null,
    )
  }

  const addVitalSign = (vitalSign: UserProfile["vitalSigns"][0]) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            vitalSigns: [...prev.vitalSigns, vitalSign],
          }
        : null,
    )
  }

  const addAppointment = (appointment: UserProfile["appointments"][0]) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            appointments: [...prev.appointments, appointment],
          }
        : null,
    )
  }

  const updateHealthGoal = (goalId: string, updates: Partial<UserProfile["healthGoals"][0]>) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            healthGoals: prev.healthGoals.map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal)),
          }
        : null,
    )
  }

  const addWoundRecord = (record: Omit<UserProfile["woundRecords"][0], "id">) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            woundRecords: [...(prev.woundRecords || []), { id: Date.now().toString(), ...record }],
          }
        : null,
    )
  }

  const addHealthRecord = (record: Omit<UserProfile["healthRecords"][0], "id">) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            healthRecords: [...(prev.healthRecords || []), { id: Date.now().toString(), ...record }],
          }
        : null,
    )
  }

  const addMedicineOrder = (order: Omit<UserProfile["medicineOrders"][0], "id" | "date">) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            medicineOrders: [
              ...(prev.medicineOrders || []),
              { id: Date.now().toString(), date: new Date().toISOString().split("T")[0], ...order },
            ],
          }
        : null,
    )
  }

  const updateWoundRecord = (woundId: string, updates: Partial<UserProfile["woundRecords"][0]>) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            woundRecords: (prev.woundRecords || []).map((wound) =>
              wound.id === woundId ? { ...wound, ...updates } : wound,
            ),
          }
        : null,
    )
  }

  return (
    <UserContext.Provider
      value={{
        user,
        updateUser,
        addMedication,
        removeMedication,
        addVitalSign,
        addAppointment,
        updateHealthGoal,
        isLoading,
        addWoundRecord,
        addHealthRecord,
        addMedicineOrder,
        updateWoundRecord,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
