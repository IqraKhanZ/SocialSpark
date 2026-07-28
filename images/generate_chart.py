"""
Generates a highly professional bar chart depicting the actual revenue breakdown of SocialSpark.
Saves the chart directly into the images folder as a high-quality JPG.
Uses matching colors: Black background, Orange (#F63B05) bars, and Cream text/accents.
"""
import os
import matplotlib.pyplot as plt

# Data
categories = [
    'B2B Hosting\n(₹3.75 L)',
    'Ticket Comm.\n(₹1.80 L)',
    'Premium Sub.\n(₹1.50 L)',
    'Brand Partner\n(₹1.25 L)',
    'NGO SaaS\n(₹1.00 L)'
]
values = [3.75, 1.80, 1.50, 1.25, 1.00]

# Create figure
fig, ax = plt.subplots(figsize=(10, 6.5), facecolor='#000000')
ax.set_facecolor('#000000')

# Colors matching the deck
orange_color = '#F63B05'
cream_color = '#FFFAE5'
gray_color = '#3A3A3A'

# Plot bars
bars = ax.bar(categories, values, color=orange_color, width=0.55, edgecolor=cream_color, linewidth=1.5)

# Style axes
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_color(gray_color)
ax.spines['bottom'].set_color(gray_color)

# Tick formatting
ax.tick_params(colors=cream_color, labelsize=12)
ax.set_ylabel('Revenue (in ₹ Lakhs)', color=cream_color, fontsize=14, labelpad=15, fontweight='bold')
ax.set_title('Revenue Stream Breakdown (5-Month Traction)', color=cream_color, fontsize=16, fontweight='bold', pad=25)

# Grid lines
ax.grid(axis='y', linestyle='--', alpha=0.3, color=cream_color)

# Add exact value labels on top of each bar
for bar in bars:
    height = bar.get_height()
    ax.annotate(f'₹{height:.2f} L',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 8),  # 8 points vertical offset
                textcoords="offset points",
                ha='center', va='bottom',
                color=cream_color, fontsize=13, fontweight='bold')

plt.tight_layout()

# Save image
output_dir = r'C:\Users\iqraf\Downloads\Social Spark\images'
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, 'revenue_stream_chart.jpg')
plt.savefig(output_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
print(f"Success: Saved real chart to {output_path}")
