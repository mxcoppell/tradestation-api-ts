#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Required environment variables
REQUIRED_ENV_VARS=(
    "CLIENT_ID"
    "CLIENT_SECRET"
    "USERNAME"
    "PASSWORD"
    "ENVIRONMENT"
)

# Function to display usage
show_usage() {
    echo -e "${BLUE}Usage:${NC} ./run-example.sh [options] <example-path> [example-path2 ...]"
    echo ""
    echo -e "${BLUE}Options:${NC}"
    echo "  -h, --help     Show this help message"
    echo "  -l, --list     List all available examples"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  ./run-example.sh QuickStart/getStarted"
    echo "  ./run-example.sh MarketData/getBars"
    echo "  ./run-example.sh Brokerage/getPositions"
    echo "  ./run-example.sh MarketData/getBars MarketData/getQuotes"
    echo ""
    if [ "$1" = "full" ]; then
        echo -e "${BLUE}Available examples:${NC}"
        find examples -name "*.ts" | sed 's|examples/||' | sed 's|.ts$||' | sort | sed 's/^/  /'
    fi
}

# Function to check environment variables
check_env_vars() {
    local missing_vars=()
    for var in "${REQUIRED_ENV_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}Error: Missing required environment variables:${NC}"
        printf '  %s\n' "${missing_vars[@]}"
        echo -e "\nPlease set these variables in your ${YELLOW}.env.local${NC} file."
        return 1
    fi
    return 0
}

# Function to run a single example
run_example() {
    local example_path="$1"
    
    # Remove .ts extension if provided
    example_path="${example_path%.ts}"
    
    # Check if the example exists
    if [ ! -f "examples/${example_path}.ts" ]; then
        echo -e "${RED}Error: Example '${example_path}' not found!${NC}"
        echo ""
        show_usage
        return 1
    fi
    
    # Try to compile the example first
    echo -e "${BLUE}Compiling example: ${example_path}${NC}"
    if ! npx tsc "examples/${example_path}.ts" --noEmit; then
        echo -e "${RED}Error: Compilation failed!${NC}"
        return 1
    fi
    
    # Run the example
    echo -e "${GREEN}Running example: ${example_path}${NC}"
    if ! npx ts-node "examples/${example_path}.ts"; then
        echo -e "${RED}Error: Example execution failed!${NC}"
        return 1
    fi
    
    return 0
}

# Parse command line arguments
if [ $# -eq 0 ]; then
    show_usage "full"
    exit 0
fi

if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_usage "full"
    exit 0
fi

if [ "$1" = "-l" ] || [ "$1" = "--list" ]; then
    echo -e "${BLUE}Available examples:${NC}"
    find examples -name "*.ts" | sed 's|examples/||' | sed 's|.ts$||' | sort | sed 's/^/  /'
    exit 0
fi

# Load environment variables from .env.local
if [ -f .env.local ]; then
    set -a
    source .env.local
    set +a
else
    echo -e "${RED}Error: .env.local not found!${NC}"
    echo -e "Please create a ${YELLOW}.env.local${NC} file with your environment variables."
    exit 1
fi

# Check environment variables
if ! check_env_vars; then
    exit 1
fi

# Track overall success
success=true

# Run each example
for example in "$@"; do
    echo -e "\n${BLUE}=== Processing ${example} ===${NC}"
    if ! run_example "$example"; then
        success=false
    fi
done

# Exit with appropriate status
$success 