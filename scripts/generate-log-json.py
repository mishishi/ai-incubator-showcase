#!/usr/bin/env python3
"""
generate-log-json.py
扫描 projects/incubated/{proj}/ 目录，解析各阶段文件，
生成结构化的 {proj}-log.json
"""
import json
import re
from pathlib import Path

WORKSPACE = Path("/root/.openclaw/workspace/projects/incubated")
OUTPUT_BASE = Path("/usr/share/nginx/html/showcase/api")
PHASE_FILES = {
    "research": "research.md",
    "spec": "SPEC.md",
    "plan": "PLAN.md",
    "design": ["design-system.md", "DESIGN.md"],
}
PHASE_NAMES = {
    "research": "市场调研",
    "spec": "产品定义",
    "plan": "开发计划",
    "design": "设计系统",
}


def parse_research(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    decisions = []
    milestones = []
    tech_choices = []

    style = re.search(r'风格方向[：:]\s*([^\n]+)', text)
    if style:
        decisions.append("设计风格: " + style.group(1).strip())

    market = re.search(r'(\$[\d.]+[MB])\s*\(?(CAGR\s*[\d.]+%)?', text)
    if market:
        decisions.append("市场规模: " + market.group(0))

    competitors = re.findall(r'### \d+\. ([^\n]+)', text)
    for c in competitors[:5]:
        decisions.append("竞品: " + c.strip())

    tech = re.findall(r'(React|TypeScript|Tailwind|Vite|Python|Node|Vue|Svelte|PostgreSQL|Redis|Docker)', text)
    for t in set(tech):
        tech_choices.append(t)

    date_m = re.search(r'调研时间[：:]\s*(\d{4}-\d{2}-\d{2})', text)
    bytes_count = len(text.encode("utf-8"))
    lines = [l.strip() for l in text.split("\n") if l.strip() and not l.startswith(">")]
    summary = "\n".join(lines[:8])[:300]

    return {
        "bytes": bytes_count,
        "summary": summary,
        "duration": None,
        "decisions": decisions[:6],
        "milestones": milestones,
        "tech_choices": list(set(tech_choices)),
        "date": date_m.group(1) if date_m else None,
    }


def parse_spec(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    decisions = []
    milestones = []
    tech_choices = []

    name = re.search(r'产品名[：:]\s*([^\n]+)', text)
    if name:
        decisions.append("产品名: " + name.group(1).strip())

    tagline = re.search(r'一句话描述[：:]\s*([^\n]+)', text)
    if tagline:
        decisions.append("定位: " + tagline.group(1).strip())

    users = re.search(r'目标用户[：:]\s*([^\n]+)', text)
    if users:
        decisions.append("目标用户: " + users.group(1).strip())

    features = re.findall(r'### \d+\.\d+ ([^\n]+)', text)
    for f in features[:6]:
        milestones.append(f.strip())

    tech = re.findall(r'(React|TypeScript|Tailwind|Vite|Python|Node|Vue|PostgreSQL|Redis|Docker)', text)
    for t in set(tech):
        tech_choices.append(t)

    bytes_count = len(text.encode("utf-8"))
    lines = [l.strip() for l in text.split("\n") if l.strip() and not l.startswith("#") and not l.startswith(">") and not l.startswith("---")]
    summary = "\n".join(lines[:6])[:300]

    return {
        "bytes": bytes_count,
        "summary": summary,
        "duration": None,
        "decisions": decisions[:6],
        "milestones": milestones[:6],
        "tech_choices": list(set(tech_choices)),
    }


def parse_plan(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    decisions = []
    milestones = []
    tech_choices = []

    done = re.findall(r'- \[x\] ([^\n`]+)', text)
    for d in done[:8]:
        milestones.append("✓ " + d.strip())

    pending = re.findall(r'- \[ \] ([^\n`]+)', text)
    for p in pending[:6]:
        milestones.append("○ " + p.strip())

    steps = re.findall(r'### Step \d+[：:]\s*([^\n]+)', text)
    for s in steps[:4]:
        decisions.append("阶段: " + s.strip())

    tech = re.findall(r'(React|TypeScript|Tailwind|Vite|Python|Node|Vue|Svelte)', text)
    for t in set(tech):
        tech_choices.append(t)

    bytes_count = len(text.encode("utf-8"))
    lines = [l.strip() for l in text.split("\n") if l.strip() and not l.startswith("#")]
    summary = "\n".join(lines[:6])[:300]

    return {
        "bytes": bytes_count,
        "summary": summary,
        "duration": None,
        "decisions": decisions[:5],
        "milestones": milestones[:8],
        "tech_choices": list(set(tech_choices)),
    }


def parse_design(path: Path, english: bool = False) -> dict:
    text = path.read_text(encoding="utf-8")
    decisions = []
    milestones = []
    tech_choices = []

    if english:
        # English format (DESIGN.md - PromptLab)
        project = re.search(r'\*\*Project:\*\* ([^\n]+)', text)
        if project:
            decisions.append("产品: " + project.group(1).strip())
        style_m = re.search(r'\*\*Style:\*\* ([^\n]+)', text)
        if style_m:
            decisions.append("风格: " + style_m.group(1).strip())
        version = re.search(r'\*\*Version:\*\* ([^\n]+)', text)
        if version:
            decisions.append("版本: " + version.group(1).strip())
        # Color tokens in table format: `--token` | `#hex` | description
        colors = re.findall(r'`(--[a-z-]+)`\s+\|\s+#([0-9a-fA-F]+)', text)
        for name, hex in colors[:6]:
            decisions.append("色 -" + name + ": #" + hex)
        heading = re.search(r'\*\*Heading Font:\*\* ([^\n]+)', text)
        if heading:
            decisions.append("标题字体: " + heading.group(1).strip())
        ui = re.search(r'\*\*UI Font:\*\* ([^\n]+)', text)
        if ui:
            decisions.append("正文字体: " + ui.group(1).strip())
        mono = re.search(r'\*\*Mono Font:\*\* ([^\n]+)', text)
        if mono:
            decisions.append("代码字体: " + mono.group(1).strip())
        tech = re.findall(r'(React|TypeScript|Tailwind|Vite|PostCSS|Vue)', text)
        for t in set(tech):
            tech_choices.append(t)
    else:
        # Chinese format (design-system.md - inkflow)
        direction = re.search(r'设计方向[：:]\s*([^\n]+)', text)
        if direction:
            decisions.append("设计方向: " + direction.group(1).strip())
        colors = re.findall(r'\|\s*\`--([a-z-]+)\`\s*\|\s*\`#([0-9a-fA-F]+)\`', text)
        for name, hex in colors[:6]:
            decisions.append("色彩 -" + name + ": #" + hex)
        font = re.search(r'(font|字体)[：:]\s*([^\n]+)', text)
        if font:
            decisions.append("字体: " + font.group(2).strip())
        tech = re.findall(r'(React|TypeScript|Tailwind|Vite|PostCSS)', text)
        for t in set(tech):
            tech_choices.append(t)

    bytes_count = len(text.encode("utf-8"))
    lines = [l.strip() for l in text.split("\n") if l.strip() and not l.startswith("|") and not l.startswith("#")]
    summary = "\n".join(lines[:6])[:300]

    return {
        "bytes": bytes_count,
        "summary": summary,
        "duration": None,
        "decisions": decisions[:8],
        "milestones": milestones,
        "tech_choices": list(set(tech_choices)),
    }


def generate_log(proj_dir: Path) -> dict:
    name = proj_dir.name
    log = {}
    for phase, filenames in PHASE_FILES.items():
        # Support both single filename and list
        for fn in ([filenames] if isinstance(filenames, str) else filenames):
            file_path = proj_dir / fn
            if file_path.exists():
                break
        if file_path.exists():
            try:
                text = file_path.read_text(encoding="utf-8")
                has_chinese = bool(re.search(r'[\u4e00-\u9fff]', text[:500]))
                if phase == "design":
                    log[phase] = parse_design(file_path, english=not has_chinese)
                elif phase == "research":
                    log[phase] = parse_research(file_path)
                elif phase == "spec":
                    log[phase] = parse_spec(file_path)
                elif phase == "plan":
                    log[phase] = parse_plan(file_path)
            except Exception as e:
                print(f"  [{name}/{phase}] parse error: {e}")
                text = file_path.read_text(encoding="utf-8")
                log[phase] = {
                    "bytes": len(text.encode("utf-8")),
                    "summary": text[:300],
                    "decisions": [],
                    "milestones": [],
                    "tech_choices": [],
                }
    return log


def main():
    OUTPUT_BASE.mkdir(parents=True, exist_ok=True)
    for proj_dir in sorted(WORKSPACE.iterdir()):
        if not proj_dir.is_dir():
            continue
        name = proj_dir.name
        print(f"Generating log for {name}...")
        log = generate_log(proj_dir)
        out_path = OUTPUT_BASE / f"{name}-log.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(log, f, ensure_ascii=False, indent=2)
        print(f"  -> {out_path}")
    print("Done.")


if __name__ == "__main__":
    main()