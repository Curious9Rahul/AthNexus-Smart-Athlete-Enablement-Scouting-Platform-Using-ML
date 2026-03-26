import { useState, useEffect } from 'react';

export interface Athlete {
    id: number;
    name: string;
    gender: 'Male' | 'Female';
    age: number;
    department: string;
    year: number;
    sport: string;
    position: string;
    experienceYears: number;
    competitionLevel: string;
    tournamentsPlayed: number;
    matchesWon: number;
    medalsWon: number;
    activeStatus: 'Yes' | 'No';
    perceivedSkill: number;
    email: string;
}

export function useAthletes() {
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAthletes = async () => {
            try {
                // Fetch the new CSV file
                const response = await fetch('/Athlete_IDs_final.csv');
                if (!response.ok) throw new Error('Failed to load athletes data');
                
                const csvText = await response.text();
                
                // Manual CSV parse
                const allLines = csvText.split('\n').filter(line => line.trim() !== '');
                
                // Skip initial empty or comma-only lines (like the first row in this file)
                let headerIdx = 0;
                while (headerIdx < allLines.length && (allLines[headerIdx].trim() === '' || /^,+$/.test(allLines[headerIdx].trim()))) {
                    headerIdx++;
                }

                if (headerIdx >= allLines.length) throw new Error('No header found in CSV');

                const headers = allLines[headerIdx].split(',').map(h => h.trim());
                
                const parsedAthletes: Athlete[] = allLines.slice(headerIdx + 1)
                    .map(line => {
                        const values = line.split(',');
                        const athlete: any = {};
                        headers.forEach((header, index) => {
                            const value = values[index]?.trim();
                            if (!header) return;
                            
                            // Map CSV headers to Athlete interface
                            if (header === 'AthleteID') athlete.id = Number(value);
                            else if (header === 'Name') athlete.name = value;
                            else if (header === 'Gender') athlete.gender = value as 'Male' | 'Female';
                            else if (header === 'Age') athlete.age = Number(value);
                            else if (header === 'Department') athlete.department = value;
                            else if (header === 'Year') athlete.year = Number(value);
                            else if (header === 'Sport') athlete.sport = value;
                            else if (header === 'Position') athlete.position = value;
                            else if (header === 'ExperienceYears') athlete.experienceYears = Number(value);
                            else if (header === 'CompetitionLevel') athlete.competitionLevel = value;
                            else if (header === 'TournamentsPlayed') athlete.tournamentsPlayed = Number(value);
                            else if (header === 'MatchesWon') athlete.matchesWon = Number(value);
                            else if (header === 'MedalsWon') athlete.medalsWon = Number(value);
                            else if (header === 'ActiveStatus') athlete.activeStatus = value as 'Yes' | 'No';
                            else if (header === 'PerceivedSkill') athlete.perceivedSkill = Number(value);
                            else if (header === 'Gmail') athlete.email = value;
                        });
                        
                        // Fallback if Gmail column is missing
                        if (!athlete.email) {
                            athlete.email = `${athlete.name?.toLowerCase().replace(/\s+/g, '.') || 'athlete'}@athnexus.com`;
                        }
                        
                        return athlete as Athlete;
                    });

                setAthletes(parsedAthletes);
            } catch (err: any) {
                console.error('Error fetching athletes:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAthletes();
    }, []);

    return { athletes, loading, error };
}
