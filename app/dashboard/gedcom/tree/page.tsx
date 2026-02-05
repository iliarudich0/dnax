"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { getUserGEDCOMFiles } from "@/lib/firebase/gedcom-storage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Users, ChevronDown, ChevronRight, User, Heart, Calendar } from "lucide-react";
import { parseGEDCOM, GEDCOMPerson, GEDCOMFamily } from "@/lib/gedcom-parser";

export default function GEDCOMTreePage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<{ individuals: GEDCOMPerson[]; families: GEDCOMFamily[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }

    loadGEDCOMFiles();
  }, [user]);

  const loadGEDCOMFiles = async () => {
    try {
      const gedcomFiles = await getUserGEDCOMFiles();
      setFiles(gedcomFiles);
      if (gedcomFiles.length > 0 && !selectedFile && gedcomFiles[0].downloadUrl) {
        setSelectedFile(gedcomFiles[0].id);
        loadGEDCOMData(gedcomFiles[0].downloadUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load GEDCOM files");
    } finally {
      setLoading(false);
    }
  };

  const loadGEDCOMData = async (url: string) => {
    try {
      setError(null);
      const response = await fetch(url);
      const gedcomText = await response.text();
      const parsed = parseGEDCOM(gedcomText);
      setTreeData(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse GEDCOM file");
    }
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const renderPerson = (person: GEDCOMPerson, depth: number = 0) => {
    const isExpanded = expandedNodes.has(person.id);
    const hasChildren = person.familiesAsSpouse && person.familiesAsSpouse.length > 0;

    return (
      <div key={person.id} style={{ marginLeft: depth * 24 }}>
        <Card className="mb-2 border-l-4 border-l-primary/50 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {hasChildren && (
                  <button
                    onClick={() => toggleNode(person.id)}
                    className="mt-1 hover:bg-secondary rounded p-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
                {!hasChildren && <div className="w-6" />}
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">
                      {person.name || "Unknown"}
                    </h3>
                    {person.sex && (
                      <Badge variant={person.sex === "M" ? "default" : "secondary"}>
                        {person.sex === "M" ? "Male" : "Female"}
                      </Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {person.birthDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Born: {person.birthDate}</span>
                      </div>
                    )}
                    {person.birthPlace && (
                      <div className="flex items-center gap-2">
                        <span>📍 {person.birthPlace}</span>
                      </div>
                    )}
                    {person.deathDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Died: {person.deathDate}</span>
                      </div>
                    )}
                    {person.deathPlace && (
                      <div className="flex items-center gap-2">
                        <span>📍 {person.deathPlace}</span>
                      </div>
                    )}
                  </div>

                  {person.occupation && (
                    <div className="mt-2 text-sm">
                      <strong>Occupation:</strong> {person.occupation}
                    </div>
                  )}

                  {person.notes && person.notes.length > 0 && (
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer font-medium">Notes</summary>
                      <div className="mt-1 pl-4 border-l-2 border-muted-foreground/20">
                        {person.notes.map((note, i) => (
                          <p key={i} className="text-muted-foreground">{note}</p>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isExpanded && person.familiesAsSpouse && treeData && (
          <div className="ml-6 border-l-2 border-muted-foreground/20 pl-2">
            {person.familiesAsSpouse.map((famId) => {
              const family = treeData.families.find((f) => f.id === famId);
              if (!family) return null;

              const spouse = family.husband === person.id 
                ? treeData.individuals.find((p) => p.id === family.wife)
                : treeData.individuals.find((p) => p.id === family.husband);

              return (
                <div key={famId} className="my-4">
                  {spouse && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>Spouse: {spouse.name || "Unknown"}</span>
                      {family.marriageDate && <span>• Married {family.marriageDate}</span>}
                    </div>
                  )}

                  {family.children && family.children.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Children ({family.children.length}):
                      </div>
                      {family.children.map((childId) => {
                        const child = treeData.individuals.find((p) => p.id === childId);
                        if (!child) return null;
                        return renderPerson(child, depth + 1);
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please sign in to view your family tree.</AlertDescription>
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

  if (files.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Family Tree</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No GEDCOM files uploaded yet. Upload a GEDCOM file on the{" "}
            <a href="/dashboard/gedcom" className="text-primary underline">GEDCOM page</a> to view your family tree.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const rootIndividuals = treeData?.individuals.filter(
    (person) => !person.familyAsChild
  ) || [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Family Tree
          </h1>
          <p className="text-muted-foreground mt-2">
            Interactive genealogical tree from your GEDCOM files
          </p>
        </div>
        {files.length > 1 && (
          <select
            value={selectedFile || ""}
            onChange={(e) => {
              setSelectedFile(e.target.value);
              const file = files.find((f) => f.id === e.target.value);
              if (file?.downloadUrl) {
                loadGEDCOMData(file.downloadUrl);
              }
            }}
            className="px-4 py-2 border rounded-md"
          >
            {files.map((file) => (
              <option key={file.id} value={file.id}>
                {file.originalName}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {treeData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">{treeData.individuals.length}</div>
                  <div className="text-sm text-muted-foreground">Individuals</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">{treeData.families.length}</div>
                  <div className="text-sm text-muted-foreground">Families</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">{rootIndividuals.length}</div>
                  <div className="text-sm text-muted-foreground">Root Ancestors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {Math.max(...treeData.individuals.map(p => getGenerationDepth(p, treeData)))}
                  </div>
                  <div className="text-sm text-muted-foreground">Generations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Family Members</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (expandedNodes.size > 0) {
                    setExpandedNodes(new Set());
                  } else {
                    setExpandedNodes(new Set(treeData.individuals.map(p => p.id)));
                  }
                }}
              >
                {expandedNodes.size > 0 ? "Collapse All" : "Expand All"}
              </Button>
            </div>

            {rootIndividuals.length > 0 ? (
              <div className="space-y-4">
                {rootIndividuals.map((person) => renderPerson(person))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No root individuals found in this GEDCOM file.</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getGenerationDepth(person: GEDCOMPerson, data: { individuals: GEDCOMPerson[]; families: GEDCOMFamily[] }, depth: number = 1): number {
  const families = data.families.filter(f => 
    f.husband === person.id || f.wife === person.id
  );
  
  if (families.length === 0 || !families.some(f => f.children && f.children.length > 0)) {
    return depth;
  }

  const childDepths = families.flatMap(family => 
    (family.children || []).map(childId => {
      const child = data.individuals.find(p => p.id === childId);
      return child ? getGenerationDepth(child, data, depth + 1) : depth;
    })
  );

  return Math.max(depth, ...childDepths);
}
