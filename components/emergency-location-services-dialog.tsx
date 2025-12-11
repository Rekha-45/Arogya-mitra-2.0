"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Heart, Pill, Navigation, Star } from "lucide-react"
import { useUser } from "@/contexts/user-context"

interface LocationServicesDialogProps {
  children: React.ReactNode
}

export function EmergencyLocationServicesDialog({ children }: LocationServicesDialogProps) {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("hospitals")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          console.log("[v0] Location permission denied")
        },
      )
    }
  }, [isOpen])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const mockPharmacies = [
    {
      id: "1",
      name: "Care Pharmacy Plus",
      address: "123 Main St, City, ST 12345",
      phone: "+1 (555) 123-4567",
      latitude: 40.7128,
      longitude: -74.006,
      rating: 4.8,
      hours: "Open until 10 PM",
    },
    {
      id: "2",
      name: "Health Mart Pharmacy",
      address: "456 Oak Ave, City, ST 12345",
      phone: "+1 (555) 234-5678",
      latitude: 40.718,
      longitude: -74.015,
      rating: 4.6,
      hours: "Open until 11 PM",
    },
    {
      id: "3",
      name: "Quick Meds Pharmacy",
      address: "789 Elm St, City, ST 12345",
      phone: "+1 (555) 345-6789",
      latitude: 40.72,
      longitude: -73.995,
      rating: 4.5,
      hours: "Open 24/7",
    },
  ]

  const mockHospitals = [
    {
      id: "1",
      name: "City General Hospital",
      address: "456 Hospital Ave, City, ST 12345",
      phone: "+1 (555) 987-6543",
      emergencyNumber: "911",
      latitude: 40.758,
      longitude: -73.9855,
      rating: 4.7,
      departments: ["Emergency", "Cardiology", "Orthopedics", "Neurology"],
    },
    {
      id: "2",
      name: "Metro Medical Center",
      address: "789 Health Blvd, City, ST 12345",
      phone: "+1 (555) 876-5432",
      emergencyNumber: "911",
      latitude: 40.7614,
      longitude: -73.9776,
      rating: 4.8,
      departments: ["Emergency", "Pediatrics", "Obstetrics", "Surgery"],
    },
    {
      id: "3",
      name: "Riverside Health Complex",
      address: "321 River Dr, City, ST 12345",
      phone: "+1 (555) 765-4321",
      emergencyNumber: "911",
      latitude: 40.7505,
      longitude: -73.9972,
      rating: 4.6,
      departments: ["Emergency", "Internal Medicine", "Oncology"],
    },
  ]

  const handleCallEmergency = (number: string) => {
    window.open(`tel:${number}`)
  }

  const handleGetDirections = (lat: number, lng: number) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <MapPin className="w-5 h-5" />
            Emergency Services & Nearby Locations
          </DialogTitle>
          <DialogDescription>Find nearby pharmacies and hospitals with contact details</DialogDescription>
        </DialogHeader>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === "hospitals" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("hospitals")}
            className="flex-1"
          >
            <Heart className="w-4 h-4 mr-2" />
            Hospitals
          </Button>
          <Button
            variant={activeTab === "pharmacies" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("pharmacies")}
            className="flex-1"
          >
            <Pill className="w-4 h-4 mr-2" />
            Pharmacies
          </Button>
        </div>

        <div className="space-y-4">
          {activeTab === "hospitals" && (
            <>
              {!userLocation && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-sm text-blue-700">
                    Enable location services to see nearby hospitals sorted by distance
                  </CardContent>
                </Card>
              )}
              {mockHospitals.map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-600" />
                          {hospital.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {hospital.rating} • Emergency 24/7
                        </CardDescription>
                      </div>
                      <Badge variant="destructive">EMERGENCY</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          {hospital.address}
                        </p>
                        <p className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <a href={`tel:${hospital.phone}`} className="text-blue-600 hover:underline">
                            {hospital.phone}
                          </a>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Departments:</p>
                        <div className="flex flex-wrap gap-1">
                          {hospital.departments.map((dept) => (
                            <Badge key={dept} variant="outline" className="text-xs">
                              {dept}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCallEmergency(hospital.emergencyNumber)}
                        className="flex-1"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call 911
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGetDirections(hospital.latitude, hospital.longitude)}
                        className="flex-1"
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {activeTab === "pharmacies" && (
            <>
              {!userLocation && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-sm text-blue-700">
                    Enable location services to see nearby pharmacies sorted by distance
                  </CardContent>
                </Card>
              )}
              {mockPharmacies.map((pharmacy) => (
                <Card key={pharmacy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-green-600" />
                          {pharmacy.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {pharmacy.rating} • {pharmacy.hours}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {pharmacy.address}
                      </p>
                      <p className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${pharmacy.phone}`} className="text-blue-600 hover:underline">
                          {pharmacy.phone}
                        </a>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCallEmergency(pharmacy.phone)}
                        className="flex-1"
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGetDirections(pharmacy.latitude, pharmacy.longitude)}
                        className="flex-1"
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
