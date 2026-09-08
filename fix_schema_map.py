import re

schema_path = r"C:\Users\IMC\Documents\ujuzi\prisma\schema.prisma"

with open(schema_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

SCALAR_TYPES = {"String", "Int", "Boolean", "DateTime", "Float", "Decimal", "Json", "Bytes", "BigInt"}

def camel_to_lower(s):
    result = s[0].lower()
    for char in s[1:]:
        if char.isupper():
            result += char.lower()
        else:
            result += char
    return result

result = []
for line in lines:
    # Only match scalar field lines: indent + fieldName + space + ScalarType + optional rest
    # Must have scalar type (not model reference like User[], Course, etc.)
    m = re.match(r'^(\s+)([a-zA-Z][a-zA-Z0-9]*)(\s+)(String|Int|Boolean|DateTime|Float|Decimal|Json|Bytes|BigInt)(.*)', line)
    if m:
        indent = m.group(1)
        field_name = m.group(2)
        space = m.group(3)
        field_type = m.group(4)
        rest = m.group(5)
        
        # Only add @map for camelCase fields (has uppercase beyond first char)
        if len(field_name) > 1 and any(c.isupper() for c in field_name[1:]):
            lower_name = camel_to_lower(field_name)
            result.append(f"{indent}{field_name}{space}{field_type}{rest} @map(\"{lower_name}\")\n")
        else:
            result.append(line)
    else:
        result.append(line)

with open(schema_path, "w", encoding="utf-8") as f:
    f.writelines(result)

print("Done - added @map only to scalar camelCase fields")
