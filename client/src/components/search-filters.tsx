import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface SearchFiltersProps {
  filters: {
    search: string;
    category: string;
    skills: string[];
    location: string;
    page: number;
  };
  onFiltersChange: (filters: any) => void;
}

const availableCategories = [
  "Commercial",
  "Runway", 
  "Editorial",
  "On-Camera",
  "Voiceover",
  "Event",
  "Corporate"
];

const availableSkills = [
  "Acting",
  "Modeling", 
  "Dance",
  "Singing",
  "Voice Acting",
  "Spanish",
  "French",
  "Yoga",
  "Sports",
  "Comedy",
  "Drama"
];

const availableLocations = [
  "New York, NY",
  "Los Angeles, CA", 
  "Chicago, IL",
  "Miami, FL",
  "Atlanta, GA",
  "Las Vegas, NV"
];

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  // Local state for search input to allow fast typing
  const [localSearch, setLocalSearch] = useState(filters.search);
  
  // Track if we're currently typing (to prevent external updates from interfering)
  const isTypingRef = useRef(false);

  // Debounce search updates - only update parent when user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update if the value has actually changed
      if (localSearch !== filters.search) {
        onFiltersChange({
          ...filters,
          search: localSearch,
          page: 1
        });
      }
      // Mark typing as finished after debounce completes
      isTypingRef.current = false;
    }, 500); // 500ms debounce for better stability

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]); // Only depend on localSearch

  // Sync local search ONLY when filters are cleared externally
  useEffect(() => {
    // Only sync if:
    // 1. User is NOT currently typing
    // 2. filters.search is empty (cleared externally)
    // 3. localSearch is not empty
    if (!isTypingRef.current && filters.search === "" && localSearch !== "") {
      setLocalSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const addSkill = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      updateFilter('skills', [...filters.skills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    updateFilter('skills', filters.skills.filter(s => s !== skill));
  };

  const clearAllFilters = () => {
    setLocalSearch(""); // Clear local search state
    onFiltersChange({
      search: "",
      category: "",
      skills: [],
      location: "",
      page: 1,
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.skills.length > 0 || filters.location;

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <Label htmlFor="search" className="text-sm font-medium text-slate-700 mb-2 block">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Name or keyword..."
              value={localSearch}
              onChange={(e) => {
                isTypingRef.current = true;
                setLocalSearch(e.target.value);
              }}
              data-testid="input-search"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Category
            </Label>
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value === "all" ? "" : value)}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2 block">
              Location
            </Label>
            <Select value={filters.location} onValueChange={(value) => updateFilter('location', value === "all" ? "" : value)}>
              <SelectTrigger data-testid="select-location">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {availableLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={clearAllFilters}
                className="w-full"
                data-testid="button-clear-filters"
              >
                <i className="fas fa-times mr-2"></i>Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-2 block">
            Skills
          </Label>
          
          {/* Selected Skills */}
          {filters.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {filters.skills.map(skill => (
                <Badge 
                  key={skill} 
                  variant="default" 
                  className="cursor-pointer"
                  onClick={() => removeSkill(skill)}
                  data-testid={`badge-selected-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {skill}
                  <i className="fas fa-times ml-1"></i>
                </Badge>
              ))}
            </div>
          )}

          {/* Available Skills */}
          <div className="flex flex-wrap gap-2">
            {availableSkills
              .filter(skill => !filters.skills.includes(skill))
              .map(skill => (
                <Badge 
                  key={skill}
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                  onClick={() => addSkill(skill)}
                  data-testid={`badge-available-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {skill}
                  <i className="fas fa-plus ml-1"></i>
                </Badge>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
