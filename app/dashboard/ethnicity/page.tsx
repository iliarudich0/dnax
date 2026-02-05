"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { db } from "@/lib/firebase/client";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EthnicityResult {
  ancestry: {
    [population: string]: number;
  };
  confidence: number;
  markers_used: number;
  total_markers: number;
}

interface DNAResult {
  id: string;
  fileName: string;
  status: string;
  ethnicity?: EthnicityResult;
  processedAt: any;
}

export default function EthnicityPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<DNAResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    if (!db) {
      setLoading(false);
      return;
    }

    const resultsRef = collection(db, "users", user.id, "dna_results");
    const q = query(
      resultsRef,
      where("status", "==", "completed"),
      orderBy("processedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DNAResult[];
      setResults(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please sign in to view your ethnicity results.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const latestResult = results.find((r) => r.ethnicity);

  if (!latestResult || !latestResult.ethnicity) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Ethnicity Estimate</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No ethnicity data available yet. Upload a DNA file to see your ancestry breakdown.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { ethnicity } = latestResult;
  const sortedAncestry = Object.entries(ethnicity.ancestry)
    .sort(([, a], [, b]) => b - a)
    .filter(([, percentage]) => percentage > 0.5); // Show only >0.5%

  // Population display names and colors
  const populationInfo: { [key: string]: { name: string; color: string; description: string } } = {
    European: {
      name: "European",
      color: "bg-blue-500",
      description: "Ancestry from Europe including Northern, Southern, Eastern, and Western regions",
    },
    African: {
      name: "African",
      color: "bg-yellow-600",
      description: "Sub-Saharan African ancestry including West, East, Central, and Southern Africa",
    },
    East_Asian: {
      name: "East Asian",
      color: "bg-red-500",
      description: "Ancestry from East Asia including Chinese, Japanese, Korean populations",
    },
    South_Asian: {
      name: "South Asian",
      color: "bg-green-600",
      description: "Ancestry from Indian subcontinent including India, Pakistan, Bangladesh, Sri Lanka",
    },
    Native_American: {
      name: "Native American",
      color: "bg-orange-500",
      description: "Indigenous ancestry from North, Central, and South America",
    },
    Middle_Eastern: {
      name: "Middle Eastern",
      color: "bg-purple-500",
      description: "Ancestry from Middle East and North Africa including Arab, Persian, Turkish populations",
    },
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Ethnicity Estimate</h1>
        <p className="text-muted-foreground">
          Based on analysis of {ethnicity.markers_used} ancestry-informative genetic markers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ancestry Breakdown</CardTitle>
          <CardDescription>
            Confidence: {ethnicity.confidence.toFixed(1)}% • Analyzed {ethnicity.markers_used} of{" "}
            {ethnicity.total_markers} markers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual bar chart */}
          <div className="space-y-4">
            {sortedAncestry.map(([population, percentage]) => {
              const info = populationInfo[population] || {
                name: population,
                color: "bg-gray-500",
                description: "",
              };
              return (
                <div key={population}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${info.color}`} />
                      <span className="font-medium">{info.name}</span>
                    </div>
                    <Badge variant="secondary">{percentage.toFixed(1)}%</Badge>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${info.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {info.description && (
                    <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
            <div>
              <div className="text-2xl font-bold">{sortedAncestry.length}</div>
              <div className="text-sm text-muted-foreground">Detected Populations</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ethnicity.markers_used}</div>
              <div className="text-sm text-muted-foreground">Markers Analyzed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ethnicity.confidence.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Confidence Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Understanding Your Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <h3 className="font-semibold text-foreground mb-2">How It Works</h3>
            <p>
              Your ethnicity estimate is calculated by analyzing ancestry-informative markers (AIMs) - specific
              genetic variants that show significant frequency differences between populations. We compare your
              DNA against reference populations from the 1000 Genomes Project and published genetic studies.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Accuracy & Limitations</h3>
            <p>
              Results are estimates based on available genetic markers. Confidence increases with more markers
              analyzed ({ethnicity.markers_used}/{ethnicity.total_markers} in your file). Ethnicity is complex
              and cannot be fully captured by genetics alone. These results are for educational purposes.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Privacy</h3>
            <p>
              All calculations are performed securely on our servers. Your genetic data is never shared with
              third parties. You can delete your data at any time from the dashboard.
            </p>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Educational purposes only.</strong> This tool provides ancestry estimates based on genetic
          markers. It is not a medical test and should not be used for health decisions. Results may differ
          from family history or commercial DNA tests due to different methodologies.
        </AlertDescription>
      </Alert>
    </div>
  );
}
