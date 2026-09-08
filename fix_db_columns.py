import subprocess
import sys

# Read the railway connection info from environment
# We'll use the railway CLI to run psql commands

commands = [
    # Add missing columns to organizations
    "ALTER TABLE organizations ADD COLUMN IF NOT EXISTS \"logoUrl\" VARCHAR(191);",
    
    # Add missing columns to competitions  
    "ALTER TABLE competitions ADD COLUMN IF NOT EXISTS \"thumbnailUrl\" VARCHAR(191);",
    
    # Add missing columns to programs
    "ALTER TABLE programs ADD COLUMN IF NOT EXISTS \"thumbnailUrl\" VARCHAR(191);",
    
    # Add missing columns to enrollments
    "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS \"courseId\" VARCHAR(191);",
    "ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS \"userId\" VARCHAR(191);",
    
    # Add missing columns to users
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS \"fullName\" VARCHAR(191);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS \"passwordHash\" VARCHAR(191);",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS \"isActive\" BOOLEAN DEFAULT true;",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS \"emailVerified\" BOOLEAN DEFAULT false;",
]

print("SQL commands to run in Railway Query Editor:")
for cmd in commands:
    print(cmd)
    print()
