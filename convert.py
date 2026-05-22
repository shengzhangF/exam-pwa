import csv, json, sys
try:
    with open('../questions.csv', 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        questions = []
        for row in reader:
            stem = row.get('题干', '').strip()
            if not stem:
                continue
            q = {
                'id': int(row.get('题号', 0)),
                'stem': stem,
                'A': row.get('A', '').strip(),
                'B': row.get('B', '').strip(),
                'C': row.get('C', '').strip(),
                'D': row.get('D', '').strip(),
                'E': row.get('E', '').strip(),
                'answer': row.get('答案', '').strip(),
                'difficulty': row.get('难度', '无').strip(),
                'qtype': row.get('题型', '单选题').strip(),
                'category': row.get('类别', '').strip()
            }
            questions.append(q)
    with open('questions.json', 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False)
    print(f'Converted {len(questions)} questions successfully')
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
