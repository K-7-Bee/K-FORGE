import type { Question } from '../types';
import { L, mc, out, sc, tf } from './helpers';

export const pythonLessonQuestions: Question[] = [
  out('pf-a', 'python', 1, 'What does this print?', 'print(7 / 2, 7 // 2)', ['3.5 3'], '`/` is true division (3.5); `//` is floor division (3).'),
  out('pf-b', 'python', 1, 'What does this print?', 'speeds = {"left": 0.20, "right": 0.30}\nprint(f"{speeds[\'right\'] - speeds[\'left\']:.2f}")', ['0.10'], 'Dictionary lookup, subtraction, formatted to two decimals.'),
  out('np-a', 'python', 2, 'What does this print?', 'import numpy as np\nv = np.array([10, 12, 11, 13])\nprint(v.mean(), v.max() - v.min())', ['11.5 3'], 'mean = 46 / 4 = 11.5; range = 13 − 10 = 3.'),
  out('np-b', 'python', 2, 'What does this print?', 'import numpy as np\nco2 = np.array([450, 900, 620, 1200])\nprint((co2 > 800).sum())', ['2'], 'A boolean mask counts the readings above 800: 900 and 1200.'),
  sc('pd-a', 'pandas', 2, 'Which pandas call gives count, mean, std, min, quartiles and max for a column?', ['df["co2"].info()', 'df["co2"].describe()', 'df["co2"].head()', 'df["co2"].shape'], 1, 'describe() returns summary statistics.'),
  sc('pd-b', 'pandas', 2, 'Readings arrive every 10 s with a datetime index. Which call gives one average per minute?', ['df.groupby("minute")', 'df.resample("1min").mean()', 'df.rolling(60).sum()', 'df.shift(60)'], 1, 'resample groups by time window; mean aggregates each window.'),
  mc('mp-a', 'pandas', 1, 'Which elements must every engineering plot have? (select all)', ['A title', 'Axis labels with units', 'As many colours as possible', 'A legend when there are several series'], [0, 1, 3], 'Titles, labelled axes with units and legends make plots readable as evidence.'),
  sc('dv-a', 'pandas', 1, 'Which chart best shows how CO₂ changes over a one-hour run?', ['Pie chart', 'Line chart over time', 'Bar chart of categories', 'Histogram'], 1, 'Time series → line chart.'),
  sc('sa-c', 'pandas', 2, 'How do you quantify sensor noise from a still period?', ['The maximum reading', 'The standard deviation of the readings', 'The first reading', 'The sum of readings'], 1, 'Standard deviation over a period with a constant true value measures noise.'),
  tf('cs-a', 'python', 1, 'When cleaning a CSV log, you should keep the raw file unchanged and save the cleaned data separately.', true, 'Keep raw data; record every cleaning step so results are reproducible.'),
  sc('cs-b', 'python', 2, 'Your cleaner expects 3 fields. A row reads "1000,650,235,9" after a firmware change. What is the best response?', ['Silently use the first three fields', 'Reject the row, count it, and investigate whether the log format changed', 'Delete the whole file', 'Pad other rows with zeros'], 1, 'An unexpected field count is a signal: reject and count it, then check the firmware output format before trusting the data.'),
  sc('au-a', 'python', 2, 'Your analysis script reads air.csv and plots it. What makes it a reliable automation tool?', ['Hard-coding the file path deep in the code', 'Command-line arguments, clear error messages on bad input, and saving outputs with predictable names', 'Running it only in a notebook', 'Ignoring missing values silently'], 1, 'Scripts that fail loudly and are parameterised can be re-run on every test log.'),
  sc('db-b', 'python', 2, 'In a paho-mqtt subscriber, where should you add a receive timestamp to each message?', ['Never — use only the robot\'s clock', 'In the on_message callback, when the message arrives', 'After the program exits', 'In the broker config'], 1, 'Record the receive time in on_message; store it next to the robot\'s time_ms to analyse delays and gaps.'),
];

export const pyFundamentals = L({
  id: 'py-fundamentals', title: 'Python fundamentals', topic: 'python', minutes: 14,
  objectives: ['Write Python scripts with lists, dicts, functions and loops', 'Use f-strings for formatted output', 'Set up a virtual environment and install packages'],
  why: `Python is your support tool for turning raw readings into evidence: plots, statistics and reports for your capstone. It is also the most common language for test automation in hardware teams.`,
  visual: { md: '| C | Python |\n|---|---|\n| `int16_t x = 5;` | `x = 5` (dynamic types) |\n| `for (int i = 0; i < n; i++)` | `for i in range(n):` |\n| `{ … }` blocks | indentation blocks |\n| `printf("%.1f", v)` | `print(f"{v:.1f}")` |\n| arrays | lists `[1, 2, 3]`, dicts `{"co2": 650}` |', caption: 'C versus Python, side by side.' },
  theory: `\`\`\`python
readings = [230, 235, 240]

def stats(values):
    """Return (min, max, mean) of a list of numbers."""
    return min(values), max(values), sum(values) / len(values)

lo, hi, mean = stats(readings)
print(f"min={lo} max={hi} avg={mean:.1f}")
sample = {"time_ms": 1000, "co2_ppm": 650, "temp_tenths_c": 235}
print(sample["co2_ppm"] / 10)
\`\`\`

#### Key differences from C
- Indentation defines blocks.
- \`/\` is true division; \`//\` is floor division.
- Integers don't overflow; floats are double precision.

#### Environment
\`\`\`
python -m venv .venv
.venv\\Scripts\\activate          (Windows)   |   source .venv/bin/activate   (Linux/macOS)
pip install numpy pandas matplotlib pyserial paho-mqtt
\`\`\`
Record dependencies in \`requirements.txt\`.`,
  worked: {
    problem: 'Parse the serial line "1000,650,235" into a dict with real units.',
    steps: ['Split on commas: `t, co2, temp = line.strip().split(",")`.', 'Convert types: int(t), int(co2), int(temp) / 10.', 'Build the dict: `{"time_s": t/1000, "co2_ppm": co2, "temp_c": temp/10}`.'],
    answer: '```python\nt, co2, temp = (int(x) for x in line.strip().split(","))\nsample = {"time_s": t / 1000, "co2_ppm": co2, "temp_c": temp / 10}\n```',
  },
  tryIt: 'Create a virtual environment, install numpy/pandas/matplotlib, and write a script that prints min, max and mean of a list of readings with one decimal place.',
  mistakes: [['Mixing tabs and spaces', 'Use 4 spaces consistently.'], ['Expecting / to truncate like C', 'Use // for floor division.'], ['Installing packages globally', 'Use a virtual environment per project.']],
  check: ['py-1', 'pf-a', 'pf-b'],
  challenge: { prompt: 'Compute mean and standard deviation of readings in Python in the lab.', exerciseId: 'lab-py-stats' },
  summary: ['Lists, dicts, functions, f-strings.', '/ vs //; indentation blocks.', 'Virtual environments + requirements.txt.'],
  cards: [['Python floor division', '7 // 2 → 3 (7 / 2 → 3.5)', 'code']],
});

export const numpyLesson = L({
  id: 'numpy', title: 'NumPy', topic: 'python', minutes: 13,
  objectives: ['Create and manipulate NumPy arrays', 'Use vectorised maths, statistics and boolean masks', 'Avoid slow Python loops on large data'],
  why: `A one-hour robot log at 10 Hz is 36 000 samples per channel. NumPy processes that in milliseconds — and the same tools compute noise, drift and error statistics for your report.`,
  visual: { md: '| Operation | NumPy |\n|---|---|\n| Element-wise maths | `v * 2`, `np.sqrt(v)` |\n| Statistics | `v.mean()`, `v.std()`, `np.median(v)` |\n| Boolean mask | `v[v > 800]`, `(v > 800).sum()` |\n| Slicing | `v[100:200]`, `v[::10]` |\n| Differences | `np.diff(ticks)` |', caption: 'NumPy operations you will use most.' },
  theory: `\`\`\`python
import numpy as np

ticks = np.array([0, 70, 141, 210, 282])           # encoder counts every 0.1 s
speed = np.diff(ticks) / 700 * np.pi * 0.065 / 0.1  # m/s, vectorised
print(speed.round(3))                               # [0.204 0.207 0.201 0.21 ]

co2 = np.array([450, 900, 620, 1200])
print(co2.mean(), co2.std(), (co2 > 800).sum())
\`\`\`

#### Why vectorise
Operations run in compiled C over whole arrays — typically 10–100× faster than Python loops.

#### Useful functions
\`np.linspace\`, \`np.arange\`, \`np.polyfit\` (fit a line, e.g. PWM vs speed), \`np.convolve\` (moving average), \`np.percentile\`.

#### Gotchas
- Integer arrays stay integer: divide with floats.
- Shapes must match (or broadcast) for element-wise operations.`,
  worked: {
    problem: 'Fit a straight line to PWM [100, 150, 200, 255] vs speed [0.16, 0.27, 0.37, 0.46] m/s and predict the PWM for 0.30 m/s.',
    steps: ['`slope, intercept = np.polyfit(pwm, speed, 1)` → slope ≈ 0.00193, intercept ≈ −0.025.', 'Solve 0.30 = slope·pwm + intercept → pwm ≈ (0.30 + 0.025) / 0.00193.', '≈ 168.'],
    answer: '**PWM ≈ 168** — a data-driven feed-forward value for the speed controller.',
  },
  tryIt: 'Convert a list of encoder tick counts into speeds with np.diff, then compute the mean and standard deviation of the speed at constant PWM.',
  mistakes: [['Looping over arrays element by element', 'Use vectorised operations.'], ['Integer division surprises', 'Ensure float arrays where needed.'], ['Shape mismatches', 'Print .shape when an operation fails.']],
  check: ['py-6', 'np-a', 'np-b'],
  challenge: { prompt: 'Using your PWM-vs-speed data (Phase 10), fit a line with np.polyfit for each wheel and report the slope and starting PWM.' },
  summary: ['Arrays + vectorised maths.', 'Statistics and boolean masks.', 'polyfit, diff, convolve for engineering data.'],
  cards: [['Count values above a threshold', '(arr > threshold).sum()', 'code']],
});

export const pandasLesson = L({
  id: 'pandas', title: 'Pandas', topic: 'pandas', minutes: 15,
  objectives: ['Load CSV logs into DataFrames with time indexes', 'Inspect, clean and summarise data', 'Resample and group time series'],
  why: `Your robot logs, the capstone energy dataset and every test run become tables. pandas makes loading, cleaning and summarising them a few readable lines.`,
  visual: { md: '| time | x_cm | y_cm | co2_ppm | rh_pct |\n|---|---|---|---|---|\n| 10:00:00 | 0 | 0 | 612 | 48.1 |\n| 10:00:05 | 25 | 0 | 618 | 48.0 |\n| 10:00:10 | 50 | 0 | NaN | 48.2 |\n| … | … | … | … | … |', caption: 'A DataFrame: labelled columns, a time index, and missing values (NaN) to handle.' },
  theory: `\`\`\`python
import pandas as pd

df = pd.read_csv("air.csv", parse_dates=["time"]).set_index("time").sort_index()
print(df.head(), df.dtypes)
print(df.isna().sum())                    # missing values per column
print(df["co2_ppm"].describe())

clean = df.dropna(subset=["co2_ppm"])     # or interpolate for short gaps
per_min = clean["co2_ppm"].resample("1min").mean()
by_cell = clean.groupby([clean.x_cm // 50, clean.y_cm // 50])["co2_ppm"].mean()   # grid map
\`\`\`

#### Checks before trusting data
- Timestamps sorted and plausible; no duplicates.
- Units and ranges make sense (CO₂ 400–5000 ppm indoors).
- Count and explain missing values.

#### Honest analysis
Split time series **by time** for any model evaluation; compare with a simple baseline; correlation ≠ causation.`,
  worked: {
    problem: 'Your log has a sequence number column. How do you compute message delivery rate in pandas?',
    steps: ['expected = df["seq"].max() − df["seq"].min() + 1.', 'received = df["seq"].nunique().', 'delivery = received / expected × 100.'],
    answer: '`100 * df.seq.nunique() / (df.seq.max() - df.seq.min() + 1)` — the reliability number for your report.',
  },
  tryIt: 'Load a CSV of your own readings (or the UCI energy dataset), print describe(), count missing values, and resample to hourly means (the syllabus Understand/Implement missions).',
  mistakes: [['Not parsing dates', 'Use parse_dates and set a datetime index.'], ['Dropping data silently', 'Count and report what you removed.'], ['Random train/test splits on time series', 'Split by time.']],
  check: ['py-3', 'pd-a', 'pd-b'],
  challenge: { prompt: 'Clean a sensor CSV stream and summarise it in the lab.', exerciseId: 'lab-py-csv' },
  summary: ['read_csv + parse_dates + datetime index.', 'describe, isna, dropna/interpolate.', 'resample and groupby for summaries and maps.'],
  cards: [['Hourly means of a time series', 'df["col"].resample("1h").mean()', 'code']],
});

export const matplotlibLesson = L({
  id: 'matplotlib', title: 'Matplotlib', topic: 'pandas', minutes: 13,
  objectives: ['Plot time series and comparisons with labelled axes and units', 'Use subplots for multiple signals', 'Save publication-quality figures'],
  why: `Plots are your evidence. A clear plot of target vs measured speed or CO₂ over the map communicates in seconds what a table can't — in your report, README and interviews.`,
  visual: { flow: ['fig, ax = plt.subplots()', 'ax.plot(x, y, label=…)', 'Title, axis labels with units, legend', 'fig.tight_layout()', 'fig.savefig("plot.png", dpi=150)'], caption: 'The standard figure recipe.' },
  theory: `\`\`\`python
import matplotlib.pyplot as plt

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6), sharex=True)
ax1.plot(log.t, log.target, label="target")
ax1.plot(log.t, log.measured, label="measured")
ax1.set_ylabel("Wheel speed (m/s)")
ax1.legend()
ax2.plot(log.t, log.pwm, color="tab:gray")
ax2.set_ylabel("PWM (0–255)")
ax2.set_xlabel("Time (s)")
fig.suptitle("Left wheel step response, Kp=3 Ki=12")
fig.tight_layout()
fig.savefig("step_response.png", dpi=150)
\`\`\`

#### Rules
- Units on every axis; descriptive titles including conditions (gains, floor).
- Same scales when comparing runs.
- Show spread (error bars, shaded min–max, scatter of repeats), not only averages.
- Save figures with the data and script that made them.`,
  worked: {
    problem: 'You compare three PID gain sets. How should you plot them for your report?',
    steps: ['One axes with the setpoint plus three measured responses, same time axis.', 'Legend naming each gain set; title with conditions.', 'Add a small table of rise time, overshoot, settling and error under the plot.'],
    answer: 'One overlaid plot + a metrics table — direct, comparable evidence.',
  },
  tryIt: 'Log 100 readings from your board and plot them with labelled axes and units (the syllabus Create mission). Save the PNG at 150 dpi into your repository.',
  mistakes: [['Missing units', 'Label every axis with its unit.'], ['Different y-scales for compared plots', 'Use sharey or fixed limits.'], ['Screenshots instead of saved figures', 'savefig with a fixed dpi.']],
  check: ['mp-a', 'dv-a', 'py-3'],
  challenge: { prompt: 'Plot target vs measured wheel speed from a PID test log with two subplots (speed and PWM), labelled and saved for your capstone report.' },
  summary: ['subplots, plot, labels with units, legend.', 'Show spread, not only averages.', 'savefig with the data and script.'],
  cards: [['Plot must-haves', 'Title with conditions, axis labels with units, legend', 'concept']],
});

export const dataviz = L({
  id: 'dataviz', title: 'Data visualisation', topic: 'pandas', minutes: 12,
  objectives: ['Choose the right chart for the question', 'Visualise spatial air-quality data as a map', 'Avoid misleading charts'],
  why: `Choosing the right chart is half of communicating a result. A heat map of CO₂ over your room is far more convincing than a column of numbers.`,
  visual: { md: '| Question | Chart |\n|---|---|\n| How does it change over time? | Line |\n| How is it distributed / how noisy? | Histogram, box plot |\n| Are two values related? | Scatter |\n| Compare categories or runs | Bar (with error bars) |\n| Where is it high or low? | Heat map / grid map |', caption: 'Pick the chart from the question.' },
  theory: `#### Air-quality map
\`\`\`python
import numpy as np, matplotlib.pyplot as plt
grid = clean.pivot_table(index=clean.y_cm // 50, columns=clean.x_cm // 50, values="co2_ppm", aggfunc="mean")
fig, ax = plt.subplots()
im = ax.imshow(grid, origin="lower", cmap="viridis")
fig.colorbar(im, ax=ax, label="CO₂ (ppm)")
ax.set_xlabel("x cell (0.5 m)"); ax.set_ylabel("y cell (0.5 m)")
\`\`\`
Mark unmeasured cells clearly (NaN shows blank) — don't interpolate silently.

#### Avoid misleading
- Bar charts start at zero.
- Don't cherry-pick runs; show all repeats or their spread.
- Perceptually uniform colour maps (viridis) — avoid rainbow for quantities.
- State sample sizes.`,
  worked: {
    problem: 'Show whether CO₂ noise differs between the SCD40 warm-up period and steady state.',
    steps: ['Split the log into "first 3 min" and "after 3 min".', 'Box plots or histograms of each segment\'s readings side by side.', 'Annotate the standard deviation of each.'],
    answer: '**Two box plots/histograms** with their standard deviations — distribution questions need distribution charts.',
  },
  tryIt: 'Make a grid heat map from any x/y/value data (even simulated values) with a labelled colour bar and blank cells for unmeasured positions.',
  mistakes: [['Rainbow colour maps for magnitudes', 'Use viridis or similar.'], ['Hiding missing cells by interpolation', 'Show them as blank or marked.'], ['Truncated bar axes', 'Start bars at zero.']],
  check: ['dv-a', 'mp-a', 'py-5'],
  challenge: { prompt: 'Produce a CO₂ (or any sensor) grid map from a robot or hand-carried survey of your room, with a colour bar and notes on conditions (doors, windows, people).' },
  summary: ['Question → chart type.', 'Heat maps for spatial data; mark unmeasured cells.', 'Avoid misleading axes, colours and cherry-picking.'],
  cards: [['Spatial sensor data chart', 'Heat map / grid map with a labelled colour bar', 'concept']],
});

export const sensorAnalysis = L({
  id: 'sensor-analysis', title: 'Sensor data analysis', topic: 'pandas', minutes: 14,
  objectives: ['Compute noise, drift, offset and settling time', 'Compare sensors against a reference', 'Report measured performance honestly'],
  why: `Your capstone test table needs numbers: sensor noise, warm-up, settling time, consistency. This lesson turns a CSV log into those numbers.`,
  visual: { diagram: 'rc-charge', caption: 'A sensor\'s step response often looks like an RC curve — settling time is when it stays within a band of the final value.' },
  theory: `\`\`\`python
still = df.loc["10:05":"10:15", "temp_c"]
noise = still.std()                                   # precision
offset = still.mean() - reference_mean                # accuracy
t = (still.index - still.index[0]).total_seconds()
drift_per_h = np.polyfit(t, still.values, 1)[0] * 3600

# settling time after a step (e.g. moving the SCD40 to fresh air at t0)
final = step.iloc[-60:].mean()
band = 0.02 * abs(final - step.iloc[0])              # within 2 % of the step size
outside = (step - final).abs() > band
settle_s = (outside[outside].index.max() - t0).total_seconds()
\`\`\`

#### Report
| Metric | How measured | Result |
|---|---|---|
| Noise | std over 10 min still | … |
| Offset | mean vs reference | … |
| Drift | slope over 1 h | … per hour |
| Settling time | step to within 2 % | … s |

Always state conditions (warm-up done? motors running?) and repeat measurements.`,
  worked: {
    problem: 'After moving the SCD40 from 900 ppm room air to 450 ppm fresh air, readings reach 459 ppm at 3 min and stay within ±9 ppm afterwards. Estimate the 2 % settling time.',
    steps: ['Step size = 450 ppm; 2 % band = ±9 ppm around the final value.', 'The readings enter and stay inside 450 ± 9 ppm at about 3 min.', 'Settling time ≈ 180 s (remember the SCD40 only updates every 5 s).'],
    answer: '**≈ 3 minutes** — so the robot must wait several minutes per point, or use the readings as a moving estimate.',
  },
  tryIt: 'Compute the noise and drift of one of your sensor logs with pandas and NumPy and write the results as a small markdown table.',
  mistakes: [['Measuring noise while the true value changes', 'Use a period where the input is constant.'], ['Ignoring warm-up', 'Discard or analyse the warm-up period separately.'], ['Single measurements', 'Repeat and report spread.']],
  check: ['sa-c', 'py-4', 'pd-a'],
  challenge: { prompt: 'Measure noise, warm-up and settling time for the BME280 or SCD40 and enter them in capstone milestones 7–8.' },
  summary: ['Noise = std, offset = mean − reference, drift = slope.', 'Settling time = stays within a band.', 'State conditions; repeat.'],
  cards: [['Sensor noise', 'Standard deviation over a period with constant input', 'concept']],
});

export const csvLesson = L({
  id: 'csv', title: 'CSV processing', topic: 'python', minutes: 12,
  objectives: ['Log board data to CSV via pyserial', 'Validate and clean rows robustly', 'Keep raw and cleaned data separate'],
  why: `CSV is the simplest reliable bridge from firmware to analysis. Getting the logging and validation right means your analysis is built on trustworthy data.`,
  visual: { flow: ['Board prints "time,co2,temp\\n"', 'pyserial reads lines', 'Validate field count and types', 'raw.csv (untouched)', 'clean.csv + cleaning log'], caption: 'From serial port to clean CSV.' },
  theory: `\`\`\`python
import csv, serial

with serial.Serial("COM3", 115200, timeout=2) as port, open("raw.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["time_ms", "co2_ppm", "temp_tenths_c"])
    for _ in range(1000):
        line = port.readline().decode(errors="ignore").strip()
        fields = line.split(",")
        if len(fields) == 3:
            w.writerow(fields)
\`\`\`
Change COM3 (Windows) or /dev/ttyUSB0 (Linux) and match the baud rate.

#### Validation rules
- Exact field count.
- Each field parses as a number (try/except).
- Values within physical ranges.
- Timestamps increasing (detect resets).

#### Discipline
Never edit raw.csv. Write clean.csv from a script and log what was dropped and why — reproducible and honest.`,
  worked: {
    problem: 'A log contains "2000,abc,236" and "4000,670". How should your cleaner treat them?',
    steps: ['"abc" fails int() → reject the row (count as non-numeric).', '"4000,670" has 2 fields → reject (count as malformed).', 'Report: 2 rows rejected out of N, with reasons.'],
    answer: 'Reject both and **count the reasons** — the cleaning log is part of your evidence.',
  },
  tryIt: 'Log 100 readings from your board over serial into raw.csv, then write a cleaner that produces clean.csv and prints how many rows were dropped and why.',
  mistakes: [['Editing raw files by hand', 'Keep raw data; clean with scripts.'], ['Wrong COM port or baud', 'Check both; close the Arduino serial monitor first.'], ['Silently dropping bad rows', 'Count and report them.']],
  check: ['cs-a', 'cs-b', 'py-2'],
  challenge: { prompt: 'Validate rows and summarise clean data in the lab.', exerciseId: 'lab-py-csv' },
  summary: ['pyserial → raw.csv.', 'Validate count, type, range, timestamps.', 'Raw untouched; clean via script with a log.'],
  cards: [['Raw data rule', 'Never edit the raw file; clean with a script and log the steps', 'concept']],
});

export const automation = L({
  id: 'automation', title: 'Basic automation', topic: 'python', minutes: 12,
  objectives: ['Write reusable command-line analysis scripts', 'Automate repetitive test and report steps', 'Make scripts fail loudly on bad input'],
  why: `You will analyse dozens of test runs. A script that turns any log into plots and a metrics table in one command saves hours — and guarantees every run is analysed the same way.`,
  visual: { flow: ['analyse.py run_017.csv', 'Load + validate', 'Compute metrics', 'Save plots + metrics.json', 'Append row to results table'], caption: 'One command per test run.' },
  theory: `\`\`\`python
import argparse, json, sys
import pandas as pd

def main():
    p = argparse.ArgumentParser(description="Analyse a robot speed log")
    p.add_argument("log"); p.add_argument("--out", default="results")
    a = p.parse_args()
    df = pd.read_csv(a.log)
    if not {"t", "target", "measured"} <= set(df.columns):
        sys.exit(f"error: {a.log} is missing required columns")
    err = (df.target - df.measured).abs()
    metrics = {"mean_abs_error": float(err.mean()), "max_abs_error": float(err.max()), "n": len(df)}
    with open(f"{a.out}/metrics.json", "w") as f: json.dump(metrics, f, indent=2)
    print(metrics)

if __name__ == "__main__":
    main()
\`\`\`

#### Good habits
- Arguments instead of hard-coded paths.
- Validate inputs and exit with a clear error.
- Deterministic output names; never overwrite raw data.
- Keep the script in Git next to the firmware.`,
  worked: {
    problem: 'Process all logs in a folder with the script above and collect a summary table.',
    steps: ['`for f in Path("logs").glob("*.csv"):` call the analysis function.', 'Collect each metrics dict with the file name into a list.', '`pd.DataFrame(rows).to_csv("summary.csv", index=False)`.'],
    answer: 'A **loop over files + summary.csv** — your capstone test table, generated in one command.',
  },
  tryIt: 'Write a script that builds your C project, runs its unit tests and saves the results to a timestamped file (the syllabus Create mission for Linux/automation).',
  mistakes: [['Hard-coded paths', 'Use argparse.'], ['Silent failures', 'Validate and exit with a message.'], ['Overwriting raw logs', 'Write outputs to a separate folder.']],
  check: ['au-a', 'cs-a', 'py-2'],
  challenge: { prompt: 'Turn your PID or sensor analysis into a command-line script that accepts a log file and writes plots plus a metrics JSON.' },
  summary: ['argparse, validation, deterministic outputs.', 'Loop over runs to build summary tables.', 'Scripts live in Git with the firmware.'],
  cards: [['Script entry-point idiom', 'if __name__ == "__main__": main()', 'code']],
});

export const dashboards = L({
  id: 'dashboards', title: 'Connecting data to dashboards', topic: 'python', minutes: 13,
  objectives: ['Subscribe to MQTT from Python and store messages', 'Plot live data with timestamps', 'Detect gaps and stale data'],
  why: `During capstone tests you want to see readings arrive live and know immediately if messages are being lost. A small Python dashboard does exactly that.`,
  visual: { flow: ['Robot publishes robot/air', 'paho-mqtt on_message', 'Append row + receive time', 'Live plot updates', 'Gap / stale-data warning'], caption: 'A live MQTT dashboard in Python.' },
  theory: `\`\`\`python
import json, time
import paho.mqtt.client as mqtt
import matplotlib.pyplot as plt

rows = []
def on_message(client, userdata, msg):
    d = json.loads(msg.payload)
    d["rx_time"] = time.time()
    rows.append(d)

client = mqtt.Client()          # paho-mqtt 2.x: mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.on_message = on_message
client.connect("localhost", 1883)
client.subscribe("robot/air")
client.loop_start()

plt.ion(); fig, ax = plt.subplots()
while True:
    if rows:
        ax.clear()
        ax.plot([r["rx_time"] - rows[0]["rx_time"] for r in rows], [r["co2_ppm"] for r in rows])
        ax.set_xlabel("Time (s)"); ax.set_ylabel("CO₂ (ppm)")
        age = time.time() - rows[-1]["rx_time"]
        ax.set_title(f"last update {age:.0f} s ago" + ("  ⚠ STALE" if age > 15 else ""))
    plt.pause(1)
\`\`\`
Save \`rows\` to CSV periodically so a crash never loses a test run.

#### Gap detection
Compare consecutive \`seq\` values; log gaps with the robot position to find dead zones.`,
  worked: {
    problem: 'Messages arrive with seq 101, 102, 105, 106. What should the dashboard do?',
    steps: ['Detect the jump 102 → 105: two messages (103, 104) lost.', 'Increment a lost counter and log the gap with time and last position.', 'Show live delivery percentage on the plot title.'],
    answer: 'Flag **2 lost messages**, record where it happened, and display the running delivery rate.',
  },
  tryIt: 'Run Mosquitto locally, publish fake JSON readings from a second Python script once per second (sometimes skipping a seq), and build the live plot with gap detection.',
  mistakes: [['Keeping data only in memory', 'Save to CSV periodically.'], ['No receive timestamps', 'Record rx_time in on_message.'], ['Not detecting stale data', 'Show the age of the last message.']],
  check: ['db-b', 'mqtt-1', 'mq-a'],
  challenge: { prompt: 'Plot live sensor readings on a simple Python dashboard (the syllabus ESP32 Create mission) with gap detection and a stale-data warning.' },
  summary: ['paho-mqtt subscriber with receive timestamps.', 'Live plot with units and last-update age.', 'Detect sequence gaps; save data continuously.'],
  cards: [['Detect lost MQTT messages', 'Check for jumps in consecutive sequence numbers', 'concept']],
});
