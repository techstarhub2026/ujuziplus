import re

schema_path = r"C:\Users\IMC\Documents\ujuzi\prisma\schema.prisma"

with open(schema_path, "r", encoding="utf-8") as f:
    content = f.read()

# Step 1: Find all enum definitions and their values
enum_blocks = []
enum_values_map = {}

enum_pattern = re.compile(r'enum\s+(\w+)\s*\{([^}]+)\}', re.MULTILINE)
for match in enum_pattern.finditer(content):
    enum_name = match.group(1)
    values = [v.strip() for v in match.group(2).split('\n') if v.strip() and not v.strip().startswith('//')]
    enum_values_map[enum_name] = values
    enum_blocks.append((enum_name, match.start(), match.end(), match.group(0)))

print(f"Found enums: {list(enum_values_map.keys())}")

# Step 2: Replace enum blocks with type aliases (remove them)
# Work backwards to preserve positions
for enum_name, start, end, full_block in sorted(enum_blocks, key=lambda x: -x[1]):
    content = content[:start] + f'// enum {enum_name} removed: {enum_values_map[enum_name]}' + content[end:]

# Step 3: Replace enum type references with String
for enum_name in enum_values_map:
    # Replace field types like `role          Role     @default(STUDENT)`
    content = re.sub(
        r'\b' + re.escape(enum_name) + r'\s+(@default\()',
        r'String@db.VarChar(191) @default(',
        content
    )
    # Replace standalone type references (may need space after)
    content = re.sub(
        r'\b' + re.escape(enum_name) + r'\s+',
        'String ',
        content
    )

# Step 4: Fix @default(ENUM_VALUE) -> @default("ENUM_VALUE")
for enum_name, values in enum_values_map.items():
    for val in values:
        # Match @default(VALUE) where VALUE is an enum member (not already quoted)
        pattern = r'@default\(' + re.escape(val) + r'\)(?!\s*[,}])'
        replacement = f'@default("{val}")'
        content = re.sub(pattern, replacement, content)

# Also fix the @db.VarChar that got concatenated wrong
content = content.replace('@default("', '@default("')
content = re.sub(r'@db\.VarChar\(191\)\s+@default', '@default', content)

# Fix the broken String@db.VarChar pattern
content = re.sub(r'String@db\.VarChar\(191\)', 'String    @db.VarChar(191)', content)

with open(schema_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done converting enums to String")
