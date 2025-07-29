import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Camera,
  Save,
  Edit,
  Bell,
  Shield,
  CreditCard,
  Settings,
  Trash2,
  Plus,
  ExternalLink,
  Upload
} from "lucide-react";
import { toast } from "sonner";

interface BusinessProfileProps {
  profile?: {
    company_name?: string;
    user?: {
      full_name?: string;
      email?: string;
    };
  };
}

export const BusinessProfile: React.FC<BusinessProfileProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState("company");
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [companyInfo, setCompanyInfo] = useState({
    name: profile?.company_name || "URContent Business",
    description: "We connect brands with authentic creators to build meaningful relationships and drive engagement.",
    industry: "Digital Marketing",
    size: "11-50 employees",
    website: "https://urcontent.com",
    email: profile?.user?.email || "business@urcontent.com",
    phone: "+52 55 1234 5678",
    address: "Av. Reforma 123, CDMX, México",
    logo: null as File | null
  });

  const [preferences, setPreferences] = useState({
    preferredCategories: ["Fashion", "Food", "Technology"],
    budgetRange: { min: 5000, max: 50000 },
    campaignTypes: ["Posts", "Stories", "Reels", "Videos"],
    languages: ["Spanish", "English"],
    targetAudience: "18-35 years, Mexico",
    collaborationStyle: "Long-term partnerships"
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    campaignUpdates: true,
    creatorApplications: true,
    performanceReports: true,
    marketingTips: false,
    weeklyDigest: true
  });

  const [billing, setBilling] = useState({
    currentPlan: "Professional",
    billingCycle: "monthly",
    nextBilling: "2024-02-15",
    paymentMethod: "**** **** **** 4242",
    autoRenew: true
  });

  const handleSave = () => {
    // Here you would typically save to your backend
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCompanyInfo(prev => ({ ...prev, logo: file }));
      toast.success("Logo uploaded successfully!");
    }
  };

  const industries = [
    "Digital Marketing",
    "E-commerce",
    "Fashion & Retail",
    "Food & Beverage",
    "Technology",
    "Healthcare",
    "Education",
    "Travel & Tourism",
    "Real Estate",
    "Automotive",
    "Other"
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees", 
    "51-200 employees",
    "201-500 employees",
    "500+ employees"
  ];

  const categories = [
    "Fashion", "Food", "Technology", "Travel", "Fitness", "Beauty", 
    "Lifestyle", "Gaming", "Music", "Art", "Sports", "Business"
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-black">Business Settings</h2>
          <p className="text-gray-500">Manage your company profile and collaboration preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-black hover:bg-gray-800">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Company Info Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card className="p-6">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Company Information</span>
              </CardTitle>
              <CardDescription>Basic information about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold">
                    {companyInfo.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div>
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <Camera className="w-4 h-4" />
                        <span>Upload Logo</span>
                      </div>
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                  </div>
                )}
              </div>

              {/* Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    value={companyInfo.industry} 
                    onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, industry: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="company-size">Company Size</Label>
                  <Select 
                    value={companyInfo.size} 
                    onValueChange={(value) => setCompanyInfo(prev => ({ ...prev, size: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="website"
                      type="url"
                      value={companyInfo.website}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                    />
                    {!isEditing && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={companyInfo.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  value={companyInfo.description}
                  onChange={(e) => setCompanyInfo(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Describe your company and what you do..."
                />
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>Contact Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="p-6">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Collaboration Preferences</span>
              </CardTitle>
              <CardDescription>Configure your preferences for working with creators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preferred Categories */}
              <div>
                <Label className="text-base font-medium">Preferred Content Categories</Label>
                <p className="text-sm text-gray-500 mb-3">Select the types of content you're most interested in</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={preferences.preferredCategories.includes(category) ? "default" : "outline"}
                      className={`cursor-pointer ${isEditing ? 'hover:bg-gray-100' : ''}`}
                      onClick={() => {
                        if (!isEditing) return;
                        setPreferences(prev => ({
                          ...prev,
                          preferredCategories: prev.preferredCategories.includes(category)
                            ? prev.preferredCategories.filter(c => c !== category)
                            : [...prev.preferredCategories, category]
                        }));
                      }}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <Label className="text-base font-medium">Typical Campaign Budget Range</Label>
                <p className="text-sm text-gray-500 mb-3">Your usual spending range per campaign</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget-min">Minimum (MXN)</Label>
                    <Input
                      id="budget-min"
                      type="number"
                      value={preferences.budgetRange.min}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        budgetRange: { ...prev.budgetRange, min: Number(e.target.value) }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget-max">Maximum (MXN)</Label>
                    <Input
                      id="budget-max"
                      type="number"
                      value={preferences.budgetRange.max}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        budgetRange: { ...prev.budgetRange, max: Number(e.target.value) }
                      }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Types */}
              <div>
                <Label className="text-base font-medium">Preferred Campaign Types</Label>
                <p className="text-sm text-gray-500 mb-3">Types of content you typically request</p>
                <div className="flex flex-wrap gap-2">
                  {["Posts", "Stories", "Reels", "Videos", "Live Streams", "Tutorials", "Reviews", "Unboxings"].map(type => (
                    <Badge
                      key={type}
                      variant={preferences.campaignTypes.includes(type) ? "default" : "outline"}
                      className={`cursor-pointer ${isEditing ? 'hover:bg-gray-100' : ''}`}
                      onClick={() => {
                        if (!isEditing) return;
                        setPreferences(prev => ({
                          ...prev,
                          campaignTypes: prev.campaignTypes.includes(type)
                            ? prev.campaignTypes.filter(t => t !== type)
                            : [...prev.campaignTypes, type]
                        }));
                      }}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Other Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="target-audience">Target Audience</Label>
                  <Input
                    id="target-audience"
                    value={preferences.targetAudience}
                    onChange={(e) => setPreferences(prev => ({ ...prev, targetAudience: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="e.g., 18-35 years, Mexico City"
                  />
                </div>
                <div>
                  <Label htmlFor="collaboration-style">Collaboration Style</Label>
                  <Select 
                    value={preferences.collaborationStyle} 
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, collaborationStyle: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="One-time projects">One-time projects</SelectItem>
                      <SelectItem value="Short-term campaigns">Short-term campaigns</SelectItem>
                      <SelectItem value="Long-term partnerships">Long-term partnerships</SelectItem>
                      <SelectItem value="Brand ambassadorships">Brand ambassadorships</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>Manage how you receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                    <p className="text-sm text-gray-500">
                      {key === 'emailNotifications' && 'Receive notifications via email'}
                      {key === 'campaignUpdates' && 'Get notified about campaign status changes'}
                      {key === 'creatorApplications' && 'New creator applications for your campaigns'}
                      {key === 'performanceReports' && 'Weekly performance summaries'}
                      {key === 'marketingTips' && 'Tips and best practices for better campaigns'}
                      {key === 'weeklyDigest' && 'Summary of your account activity'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))}
                    disabled={!isEditing}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="p-6">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Billing & Subscription</span>
              </CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{billing.currentPlan} Plan</h3>
                    <p className="text-sm text-gray-600">
                      Billing {billing.billingCycle} • Next payment: {billing.nextBilling}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="text-base font-medium">Payment Method</Label>
                <div className="flex items-center justify-between p-4 border rounded-lg mt-2">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{billing.paymentMethod}</p>
                      <p className="text-sm text-gray-500">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
              </div>

              {/* Auto Renewal */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto-renewal</Label>
                  <p className="text-sm text-gray-500">Automatically renew your subscription</p>
                </div>
                <Switch
                  checked={billing.autoRenew}
                  onCheckedChange={(checked) => setBilling(prev => ({ ...prev, autoRenew: checked }))}
                />
              </div>

              {/* Plan Comparison */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Available Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Starter", price: "$99", features: ["5 campaigns/month", "Basic analytics", "Email support"] },
                    { name: "Professional", price: "$299", features: ["20 campaigns/month", "Advanced analytics", "Priority support"], current: true },
                    { name: "Enterprise", price: "$599", features: ["Unlimited campaigns", "Custom analytics", "Dedicated manager"] }
                  ].map((plan, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${plan.current ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{plan.name}</h4>
                        {plan.current && <Badge>Current</Badge>}
                      </div>
                      <p className="text-2xl font-bold mb-3">{plan.price}<span className="text-sm font-normal text-gray-500">/month</span></p>
                      <ul className="text-sm space-y-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {!plan.current && (
                        <Button className="w-full mt-4" variant="outline">
                          Upgrade
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};