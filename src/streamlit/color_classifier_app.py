
import streamlit as st
import pandas as pd
import numpy as np
import time
from typing import List, Dict, Tuple, Optional, Union, Any
import re
import io
from functools import lru_cache

# Set page configuration
st.set_page_config(
    page_title="Color Family Classifier",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS for better styling
st.markdown("""
<style>
    .color-swatch {
        width: 100%;
        height: 60px;
        border-radius: 4px;
        border: 1px solid #ddd;
    }
    .color-card {
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ddd;
        background-color: white;
        margin-bottom: 10px;
    }
    .family-container {
        padding: 10px;
        border-radius: 4px;
        background-color: #f9f9f9;
        margin-bottom: 20px;
    }
    .color-text {
        font-size: 0.8em;
        margin-top: 5px;
    }
    .stButton button {
        width: 100%;
    }
</style>
""", unsafe_allow_html=True)

# --- Color Classification Functions ---

@st.cache_data
def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert HEX color to RGB tuple with caching for performance."""
    # Remove # if present
    hex_color = hex_color.lstrip('#')
    
    # Parse hex values
    if len(hex_color) == 3:
        r = int(hex_color[0] + hex_color[0], 16)
        g = int(hex_color[1] + hex_color[1], 16)
        b = int(hex_color[2] + hex_color[2], 16)
    else:
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
    
    return (r, g, b)

@st.cache_data
def rgb_to_hsl(r: int, g: int, b: int) -> Tuple[float, float, float]:
    """Convert RGB to HSL with caching."""
    r_norm = r / 255.0
    g_norm = g / 255.0
    b_norm = b / 255.0
    
    max_val = max(r_norm, g_norm, b_norm)
    min_val = min(r_norm, g_norm, b_norm)
    
    # Calculate lightness
    l = (max_val + min_val) / 2
    
    # Calculate saturation
    if max_val == min_val:
        # Achromatic case
        s = 0
        h = 0  # Technically undefined, but we set to 0
    else:
        d = max_val - min_val
        s = d / (2 - max_val - min_val) if l > 0.5 else d / (max_val + min_val)
        
        # Calculate hue
        if max_val == r_norm:
            h = (g_norm - b_norm) / d + (6 if g_norm < b_norm else 0)
        elif max_val == g_norm:
            h = (b_norm - r_norm) / d + 2
        else:  # max_val == b_norm
            h = (r_norm - g_norm) / d + 4
            
        h /= 6  # Scale to [0, 1]
    
    # Convert to degrees and percentages
    h = round(h * 360)
    s = round(s * 100)
    l = round(l * 100)
    
    return (h, s, l)

@st.cache_data
def get_color_family(rgb: Tuple[int, int, int]) -> Dict[str, str]:
    """
    Classify color into a family based on RGB values.
    Returns a dict with main family and sub-family.
    
    This is optimized for Streamlit performance with caching.
    """
    r, g, b = rgb
    hue, saturation, lightness = rgb_to_hsl(r, g, b)
    
    # Check for neutrals first with low saturation
    if saturation <= 15:
        if lightness <= 15:
            return {"main": "Black", "sub": "Black"}
        if lightness >= 85:
            return {"main": "White", "sub": "White"}
        return {"main": "Gray", "sub": get_lightness_tone(lightness)}
    
    # Check for browns
    if saturation < 50 and lightness > 15 and lightness < 60:
        if (0 <= hue <= 40) or (hue >= 355):
            sub_shade = get_brown_shade(hue, saturation, lightness)
            return {"main": "Brown", "sub": sub_shade}
    
    # Determine main color family based on HSL hue
    if (hue >= 355 or hue < 10):
        return {"main": "Red", "sub": get_red_shade(hue, saturation, lightness)}
    elif (hue >= 10 and hue < 40):
        return {"main": "Orange", "sub": get_orange_shade(hue, saturation, lightness)}
    elif (hue >= 40 and hue < 65):
        return {"main": "Yellow", "sub": get_yellow_shade(hue, saturation, lightness)}
    elif (hue >= 65 and hue < 160):
        return {"main": "Green", "sub": get_green_shade(hue, saturation, lightness)}
    elif (hue >= 160 and hue < 190):
        return {"main": "Aqua/Teal", "sub": get_teal_shade(hue, saturation, lightness)}
    elif (hue >= 190 and hue < 260):
        return {"main": "Blue", "sub": get_blue_shade(hue, saturation, lightness)}
    elif (hue >= 260 and hue < 330):
        return {"main": "Purple", "sub": get_purple_shade(hue, saturation, lightness)}
    elif (hue >= 330 and hue < 355):
        return {"main": "Pink", "sub": get_pink_shade(hue, saturation, lightness)}
    
    return {"main": "Unknown", "sub": "Unknown"}

# Helper functions for specific shade determination
@st.cache_data
def get_red_shade(hue, saturation, lightness):
    if lightness < 30:
        return "Maroon"
    if lightness < 45:
        return "Ruby" if saturation > 75 else "Burgundy"
    if hue < 5 or hue >= 355:
        return "Scarlet" if lightness > 60 else "Crimson"
    if lightness > 60:
        return "Cherry"
    return "Cardinal"

@st.cache_data
def get_orange_shade(hue, saturation, lightness):
    if hue < 20:
        return "Coral" if lightness < 50 else "Vermilion"
    if hue > 30:
        return "Amber"
    if saturation < 60:
        return "Terracotta"
    if lightness > 70:
        return "Peach"
    if lightness > 60:
        return "Tangerine"
    return "Rust"

@st.cache_data
def get_yellow_shade(hue, saturation, lightness):
    if hue < 50:
        if lightness < 50:
            return "Ochre"
        return "Gold" if saturation > 80 else "Honey"
    if saturation < 50:
        return "Mustard"
    if lightness > 80:
        return "Lemon"
    return "Canary"

@st.cache_data
def get_green_shade(hue, saturation, lightness):
    if hue < 80:
        return "Chartreuse"
    if hue > 140:
        return "Teal"
    if hue > 100 and lightness < 40:
        return "Forest"
    if lightness > 70:
        return "Sage" if saturation < 50 else "Mint"
    if saturation < 50:
        return "Olive"
    if lightness < 40:
        return "Hunter"
    if hue < 100:
        return "Lime"
    return "Emerald"

@st.cache_data
def get_blue_shade(hue, saturation, lightness):
    if hue < 205:
        return "Turquoise"
    if hue > 225:
        return "Indigo" if lightness < 50 else "Ultramarine"
    if lightness < 30:
        return "Navy"
    if lightness > 70:
        return "Sky"
    if lightness > 50 and saturation > 60:
        return "Azure"
    if saturation > 70:
        return "Cobalt"
    return "Royal"

@st.cache_data
def get_purple_shade(hue, saturation, lightness):
    if hue < 280:
        return "Violet" if lightness < 50 else "Periwinkle"
    if hue > 300:
        return "Magenta"
    if lightness < 30:
        return "Eggplant"
    if lightness > 80:
        return "Lavender"
    if lightness > 65:
        return "Lilac"
    if saturation > 70:
        return "Amethyst"
    return "Mauve"

@st.cache_data
def get_pink_shade(hue, saturation, lightness):
    if lightness > 80:
        return "Light Pink"
    if saturation > 80:
        return "Hot Pink"
    if lightness < 50:
        return "Deep Pink"
    if saturation < 60:
        return "Blush"
    if hue > 345:
        return "Rose"
    if hue < 335:
        return "Magenta"
    return "Fuchsia"

@st.cache_data
def get_brown_shade(hue, saturation, lightness):
    if lightness < 25:
        return "Chocolate"
    if lightness > 45:
        if saturation < 30:
            return "Tan"
        return "Caramel"
    if hue > 25:
        return "Sienna"
    if saturation > 40:
        return "Coffee"
    return "Mocha"

@st.cache_data
def get_teal_shade(hue, saturation, lightness):
    if lightness < 30:
        return "Deep Teal"
    if lightness > 70:
        return "Light Aqua"
    if saturation < 40:
        return "Muted Teal"
    return "Turquoise"

@st.cache_data
def get_lightness_tone(lightness):
    if lightness < 20:
        return "Charcoal"
    if lightness > 80:
        return "Silver"
    if lightness > 60:
        return "Ash"
    if lightness > 40:
        return "Slate"
    return "Graphite"

# Color parsing function
@st.cache_data
def parse_color(color_str: str) -> Tuple[int, int, int]:
    """Parse color from either HEX or RGB string format."""
    # Clean the string
    color_str = color_str.strip().lower()
    
    # Check if it's a HEX color
    if color_str.startswith('#'):
        return hex_to_rgb(color_str)
    
    # Check if it's a HEX without #
    hex_pattern = re.compile(r'^[0-9a-f]{6}$')
    if hex_pattern.match(color_str):
        return hex_to_rgb(color_str)
    
    # Check if it's RGB format
    rgb_pattern = re.compile(r'rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)', re.IGNORECASE)
    rgb_match = rgb_pattern.match(color_str)
    if rgb_match:
        r = int(rgb_match.group(1))
        g = int(rgb_match.group(2))
        b = int(rgb_match.group(3))
        return (r, g, b)
    
    # Default to black if format is unknown
    st.warning(f"Unknown color format: {color_str}. Defaulting to black.")
    return (0, 0, 0)

# Process data in batches for better performance
def process_colors_in_batches(df: pd.DataFrame, batch_size: int = 100) -> pd.DataFrame:
    """Process color data in batches to prevent UI freezing."""
    result_df = df.copy()
    
    # Create empty columns for family and subfamily
    if 'ColorFamily' not in result_df.columns:
        result_df['ColorFamily'] = None
    if 'ColorSubFamily' not in result_df.columns:
        result_df['ColorSubFamily'] = None
    
    # Create progress bar
    progress_bar = st.progress(0)
    
    # Process in batches
    total_rows = len(result_df)
    for i in range(0, total_rows, batch_size):
        # Calculate current batch bounds
        end_idx = min(i + batch_size, total_rows)
        
        # Update progress
        progress = int((i / total_rows) * 100)
        progress_bar.progress(progress)
        
        # Process batch
        batch_df = result_df.iloc[i:end_idx].copy()
        
        # Apply color family classification in batch
        if 'RGB' in batch_df.columns:
            for idx, row in batch_df.iterrows():
                rgb = parse_color(row['RGB'])
                family = get_color_family(rgb)
                result_df.at[idx, 'ColorFamily'] = family['main']
                result_df.at[idx, 'ColorSubFamily'] = family['sub']
        elif 'HEX' in batch_df.columns:
            for idx, row in batch_df.iterrows():
                rgb = hex_to_rgb(row['HEX'])
                family = get_color_family(rgb)
                result_df.at[idx, 'ColorFamily'] = family['main']
                result_df.at[idx, 'ColorSubFamily'] = family['sub']
    
    # Complete progress bar
    progress_bar.progress(100)
    
    return result_df

# --- Streamlit App UI Components ---

def main():
    st.title("Color Family Classifier")
    
    # Sidebar for app controls
    with st.sidebar:
        st.header("Upload & Settings")
        
        uploaded_file = st.file_uploader("Upload color data (Excel/CSV)", type=['xlsx', 'csv'])
        
        # Settings
        batch_size = st.slider("Batch Processing Size", 10, 500, 100, 
                               help="Larger batches process faster but may cause UI lag")
        
        display_format = st.radio(
            "Display Format",
            ["HEX", "RGB", "Both"],
            horizontal=True
        )
        
        show_subfamilies = st.checkbox("Show Color Subfamilies", value=True)
        
        # View options
        st.subheader("View Options")
        grouping_option = st.radio(
            "Color Grouping",
            ["Grouped by Family", "All Colors (Ungrouped)"],
            horizontal=True
        )
        
        columns_per_row = st.slider("Colors per row", 2, 8, 4)
        
        if uploaded_file is not None:
            st.download_button(
                "Download Classified Results",
                data=prepare_download(st.session_state.get('processed_data')),
                file_name="classified_colors.xlsx",
                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                disabled='processed_data' not in st.session_state
            )

    # Main content area
    if uploaded_file is not None:
        # Process the uploaded file
        try:
            if uploaded_file.name.endswith('.xlsx'):
                df = pd.read_excel(uploaded_file)
            else:
                df = pd.read_csv(uploaded_file)
            
            # Check if we already processed this file (using cache)
            file_hash = hash(uploaded_file.getvalue().tobytes())
            
            if 'last_file_hash' not in st.session_state or st.session_state.last_file_hash != file_hash:
                st.session_state.last_file_hash = file_hash
                
                # Process data with a spinner to show activity
                with st.spinner("Processing colors..."):
                    processed_df = process_colors_in_batches(df, batch_size)
                    st.session_state.processed_data = processed_df
                
                st.success(f"Successfully processed {len(processed_df)} colors")
            
            # Display data based on grouping preference
            if grouping_option == "Grouped by Family":
                display_grouped_colors(
                    st.session_state.processed_data, 
                    columns_per_row,
                    show_subfamilies,
                    display_format
                )
            else:
                display_all_colors(
                    st.session_state.processed_data,
                    columns_per_row, 
                    display_format
                )
                
        except Exception as e:
            st.error(f"Error processing file: {str(e)}")
            st.exception(e)
    else:
        # Show welcome message when no file is uploaded
        display_welcome_message()

def display_welcome_message():
    """Display welcome message and instructions."""
    st.markdown("""
    # Welcome to the Color Family Classifier!
    
    This tool helps you organize and classify colors based on their RGB or HEX values.
    
    ## How to use:
    1. Upload your color data file (Excel or CSV format)
    2. Adjust the settings in the sidebar 
    3. View your colors grouped by family or all at once
    4. Download the classified results when done
    
    ## Expected file format:
    Your file should contain at least one of these columns:
    - "HEX" (e.g., "#FF5733" or "FF5733")
    - "RGB" (e.g., "rgb(255, 87, 51)")
    
    Optional columns:
    - "Name" - Color names
    - "CIELAB" - Lab values if available
    
    ## About the classification:
    This app uses RGB-to-HSL conversion to classify colors into intuitive families like Red, Blue, Green, etc., and further into subfamilies like Crimson, Navy, Forest, etc.
    """)
    
    # Show sample data
    st.subheader("Sample Data Format")
    sample_data = {
        "Name": ["Vibrant Red", "Sky Blue", "Forest Green", "Sunny Yellow"],
        "HEX": ["#FF0000", "#87CEEB", "#228B22", "#FFFF00"],
        "RGB": ["rgb(255, 0, 0)", "rgb(135, 206, 235)", "rgb(34, 139, 34)", "rgb(255, 255, 0)"]
    }
    st.dataframe(pd.DataFrame(sample_data))

def display_grouped_colors(df, columns_per_row, show_subfamilies, display_format):
    """Display colors grouped by color family."""
    # Get unique color families and sort them
    color_families = sorted(df['ColorFamily'].unique())
    
    # Handle search
    search_query = st.text_input("Search colors by name:", "")
    if search_query:
        df = df[df['Name'].str.contains(search_query, case=False, na=False)]
        if len(df) == 0:
            st.warning(f"No colors found matching '{search_query}'")
            return
    
    # Optional: color family filter
    selected_family = st.selectbox(
        "Filter by color family:", 
        ["All Families"] + list(color_families)
    )
    
    if selected_family != "All Families":
        df = df[df['ColorFamily'] == selected_family]
    
    # Count total colors
    st.write(f"Showing {len(df)} colors")
    
    # Display color families
    for family in color_families:
        family_colors = df[df['ColorFamily'] == family]
        if len(family_colors) == 0:
            continue
            
        # Create collapsible section for each family
        with st.expander(f"{family} ({len(family_colors)} colors)", expanded=selected_family == family):
            if show_subfamilies:
                # Group by subfamily
                subfamilies = family_colors.groupby('ColorSubFamily')
                
                for subfamily_name, subfamily_group in subfamilies:
                    st.subheader(f"{subfamily_name}")
                    
                    # Create a grid layout for colors
                    cols = st.columns(columns_per_row)
                    for idx, (_, color) in enumerate(subfamily_group.iterrows()):
                        with cols[idx % columns_per_row]:
                            display_color_card(color, display_format)
            else:
                # Just show colors without subfamily grouping
                cols = st.columns(columns_per_row)
                for idx, (_, color) in enumerate(family_colors.iterrows()):
                    with cols[idx % columns_per_row]:
                        display_color_card(color, display_format)

def display_all_colors(df, columns_per_row, display_format):
    """Display all colors without grouping."""
    # Handle search
    search_query = st.text_input("Search colors by name:", "")
    if search_query:
        df = df[df['Name'].str.contains(search_query, case=False, na=False)]
        if len(df) == 0:
            st.warning(f"No colors found matching '{search_query}'")
            return
    
    # Sort options
    sort_option = st.selectbox(
        "Sort by:", 
        ["Name", "Color Family", "Most Recent"]
    )
    
    if sort_option == "Name":
        df = df.sort_values(by="Name")
    elif sort_option == "Color Family":
        df = df.sort_values(by=["ColorFamily", "ColorSubFamily", "Name"])
    # Most recent doesn't need sorting as it's the default
    
    # Count total colors
    st.write(f"Showing {len(df)} colors")
    
    # Create grid layout
    cols = st.columns(columns_per_row)
    for idx, (_, color) in enumerate(df.iterrows()):
        with cols[idx % columns_per_row]:
            display_color_card(color, display_format)

def display_color_card(color, display_format):
    """Display a single color card."""
    # Get color values
    name = color.get('Name', 'Unnamed Color')
    hex_value = color.get('HEX', '#000000')
    if not hex_value.startswith('#'):
        hex_value = f"#{hex_value}"
    
    rgb_value = color.get('RGB', "")
    if not rgb_value and 'r' in color and 'g' in color and 'b' in color:
        rgb_value = f"rgb({color['r']}, {color['g']}, {color['b']})"
    
    family = color.get('ColorFamily', 'Unknown')
    subfamily = color.get('ColorSubFamily', '')
    
    # Create the card
    with st.container():
        st.markdown(f"""
        <div class="color-card">
            <div class="color-swatch" style="background-color: {hex_value};"></div>
            <div class="color-text">
                <strong>{name}</strong><br>
                {family} {f'({subfamily})' if subfamily else ''}<br>
                {hex_value if display_format in ['HEX', 'Both'] else ''}
                {f'<br>{rgb_value}' if display_format in ['RGB', 'Both'] and rgb_value else ''}
            </div>
        </div>
        """, unsafe_allow_html=True)

def prepare_download(df):
    """Prepare dataframe for download."""
    if df is None:
        return io.BytesIO()
        
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, sheet_name='Classified Colors', index=False)
        
        # Access the workbook and worksheet
        workbook = writer.book
        worksheet = writer.sheets['Classified Colors']
        
        # Add a format for the color cells
        color_format = workbook.add_format({'bold': True})
        
        # Find HEX column index
        hex_col_idx = None
        for i, col in enumerate(df.columns):
            if col.lower() == 'hex':
                hex_col_idx = i
                break
        
        # If HEX column exists, color the cells with their respective colors
        if hex_col_idx is not None:
            for row_idx, hex_value in enumerate(df['HEX']):
                try:
                    # Clean hex value
                    hex_clean = hex_value.replace('#', '') if isinstance(hex_value, str) else ''
                    if hex_clean:
                        cell_format = workbook.add_format({
                            'bg_color': f'#{hex_clean}'
                        })
                        worksheet.write(row_idx + 1, hex_col_idx, hex_value, cell_format)
                except Exception:
                    # Continue if there's an issue with a particular color
                    pass
    
    output.seek(0)
    return output

# --- Run the app ---
if __name__ == "__main__":
    main()
