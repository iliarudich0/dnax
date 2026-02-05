export interface GEDCOMPerson {
  id: string;
  name?: string;
  sex?: "M" | "F";
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  occupation?: string;
  notes: string[];
  familyAsChild?: string;
  familiesAsSpouse: string[];
}

export interface GEDCOMFamily {
  id: string;
  husband?: string;
  wife?: string;
  children: string[];
  marriageDate?: string;
  marriagePlace?: string;
}

export function parseGEDCOM(gedcomText: string): { individuals: GEDCOMPerson[]; families: GEDCOMFamily[] } {
  const lines = gedcomText.split(/\r?\n/);
  const individuals: GEDCOMPerson[] = [];
  const families: GEDCOMFamily[] = [];

  let currentIndividual: GEDCOMPerson | null = null;
  let currentFamily: GEDCOMFamily | null = null;
  let currentTag = "";
  let currentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(/^(\d+)\s+(@\w+@\s+)?(\w+)(\s+(.*))?$/);
    if (!match) continue;

    const level = parseInt(match[1]);
    const id = match[2]?.trim();
    const tag = match[3];
    const value = match[5] || "";

    // Individual
    if (level === 0 && tag === "INDI" && id) {
      if (currentIndividual) individuals.push(currentIndividual);
      currentIndividual = {
        id: id.replace(/@/g, ""),
        notes: [],
        familiesAsSpouse: [],
      };
      currentTag = "INDI";
      currentLevel = level;
    }
    // Family
    else if (level === 0 && tag === "FAM" && id) {
      if (currentFamily) families.push(currentFamily);
      if (currentIndividual) {
        individuals.push(currentIndividual);
        currentIndividual = null;
      }
      currentFamily = {
        id: id.replace(/@/g, ""),
        children: [],
      };
      currentTag = "FAM";
      currentLevel = level;
    }
    // Person properties
    else if (currentIndividual && level === 1) {
      if (tag === "NAME") {
        currentIndividual.name = value.replace(/\//g, "").trim();
      } else if (tag === "SEX") {
        currentIndividual.sex = value as "M" | "F";
      } else if (tag === "BIRT") {
        currentTag = "BIRT";
      } else if (tag === "DEAT") {
        currentTag = "DEAT";
      } else if (tag === "OCCU") {
        currentIndividual.occupation = value;
      } else if (tag === "NOTE") {
        currentIndividual.notes.push(value);
      } else if (tag === "FAMC") {
        currentIndividual.familyAsChild = value.replace(/@/g, "");
      } else if (tag === "FAMS") {
        currentIndividual.familiesAsSpouse.push(value.replace(/@/g, ""));
      }
    }
    // Birth/Death details
    else if (currentIndividual && level === 2) {
      if (currentTag === "BIRT") {
        if (tag === "DATE") {
          currentIndividual.birthDate = value;
        } else if (tag === "PLAC") {
          currentIndividual.birthPlace = value;
        }
      } else if (currentTag === "DEAT") {
        if (tag === "DATE") {
          currentIndividual.deathDate = value;
        } else if (tag === "PLAC") {
          currentIndividual.deathPlace = value;
        }
      }
    }
    // Family properties
    else if (currentFamily && level === 1) {
      if (tag === "HUSB") {
        currentFamily.husband = value.replace(/@/g, "");
      } else if (tag === "WIFE") {
        currentFamily.wife = value.replace(/@/g, "");
      } else if (tag === "CHIL") {
        currentFamily.children.push(value.replace(/@/g, ""));
      } else if (tag === "MARR") {
        currentTag = "MARR";
      }
    }
    // Marriage details
    else if (currentFamily && level === 2 && currentTag === "MARR") {
      if (tag === "DATE") {
        currentFamily.marriageDate = value;
      } else if (tag === "PLAC") {
        currentFamily.marriagePlace = value;
      }
    }
  }

  // Push last items
  if (currentIndividual) individuals.push(currentIndividual);
  if (currentFamily) families.push(currentFamily);

  return { individuals, families };
}
