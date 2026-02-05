"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Calendar, FileText, Users, Dna, AlertCircle } from "lucide-react";
import { getFirestoreDb } from "@/lib/firebase/client";
import { collection, query, getDocs, where } from "firebase/firestore";
import { getUserGEDCOMFiles } from "@/lib/firebase/gedcom-storage";

interface UserStats {
  totalDNAUploads: number;
  totalGEDCOMFiles: number;
  totalSNPs: number;
  latestEthnicity: any;
  memberSince: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    if (!user || !user.id) return;

    try {
      const db = getFirestoreDb();
      if (!db) return;

      // Get DNA results
      const dnaRef = collection(db, "users", user.id, "dna_results");
      const dnaSnapshot = await getDocs(dnaRef);
      
      let totalSNPs = 0;
      let latestEthnicity = null;
      let latestDate = 0;

      dnaSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.totalSnps) {
          totalSNPs = Math.max(totalSNPs, data.totalSnps);
        }
        if (data.ethnicity && data.uploadedAt) {
          const date = new Date(data.uploadedAt).getTime();
          if (date > latestDate) {
            latestDate = date;
            latestEthnicity = data.ethnicity;
          }
        }
      });

      // Get GEDCOM files
      const gedcomFiles = await getUserGEDCOMFiles();

      setStats({
        totalDNAUploads: dnaSnapshot.size,
        totalGEDCOMFiles: gedcomFiles.length,
        totalSNPs,
        latestEthnicity,
        memberSince: user.createdAt || new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card>
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Please sign in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <User className="h-8 w-8" />
          My Profile
        </h1>
        <p className="text-muted-foreground">Your personal genetic genealogy dashboard</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {stats?.memberSince ? new Date(stats.memberSince).toLocaleDateString() : "Recently"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-xs">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {/* DNA Uploads */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Dna className="h-4 w-4" />
                DNA Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalDNAUploads || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Processed files</p>
            </CardContent>
          </Card>

          {/* SNPs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Total SNPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.totalSNPs ? (stats.totalSNPs / 1000).toFixed(0) + "K" : "0"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Genetic markers</p>
            </CardContent>
          </Card>

          {/* GEDCOM Files */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Family Trees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalGEDCOMFiles || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">GEDCOM files</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Latest Ethnicity Results */}
      {stats?.latestEthnicity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dna className="h-5 w-5" />
              Latest Ethnicity Estimate
            </CardTitle>
            <CardDescription>
              {stats.latestEthnicity.calculator || "Comprehensive Ancestry Calculator"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.latestEthnicity.ancestry && (
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(stats.latestEthnicity.ancestry)
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .map(([population, percentage]: [string, any]) => (
                    <div key={population} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize font-medium">
                          {population.replace(/_/g, " ")}
                        </span>
                        <span className="font-semibold">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
            <div className="flex gap-4 text-sm text-muted-foreground pt-2 border-t">
              <div>
                <span className="font-medium">Confidence:</span> {stats.latestEthnicity.confidence?.toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">Markers:</span> {stats.latestEthnicity.markers_used}/{stats.latestEthnicity.total_markers}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Your Data is Private</p>
              <p className="text-sm text-muted-foreground">
                All your DNA data, family trees, and results are stored privately under your account. 
                Only you can access your genetic information. Other users cannot see your data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
