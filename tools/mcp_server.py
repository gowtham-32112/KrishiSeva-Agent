"""
MCP Server for KrishiSeva Agent.
Registers fetch_local_weather as a Model Context Protocol tool over stdio channels.
Any MCP-compliant host (Claude Desktop, custom ADK runtimes) can invoke this tool directly.
"""
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server

    # Initialize MCP server
    mcp = Server("krishiseva-weather-mcp")

    # Import weather tool
    from tools.weather_tool import get_weather_context

    @mcp.tool()
    def fetch_local_weather(location: str, crop: str) -> dict:
        """
        Retrieve live localized meteorological statistics for Indian agricultural districts.

        Args:
            location: The town or district name (e.g., Vijayawada, Guntur, Nagpur, Shimla)
            crop: The plant name under review (e.g., Tomato, Rice, Cotton, Wheat)

        Returns:
            dict: Microclimate data containing temperature, humidity, rain alert,
                  wind speed, and agricultural advisory text.
        """
        print(f"[MCP Server] Querying weather for location: {location}, crop: {crop}")
        return get_weather_context(location, crop)

    async def main():
        """
        Run the Model Context Protocol stdio server.
        Integrates KrishiSeva weather streams into LLM agent execution contexts.
        """
        print("[MCP Server] Starting krishiseva-weather-mcp stdio channel...")
        async with stdio_server() as streams:
            await mcp.run(
                streams[0], streams[1],
                mcp.create_initialization_options()
            )

    if __name__ == "__main__":
        asyncio.run(main())

except ImportError:
    # MCP library not installed — provide a stub for environments without it
    print("[MCP Server] Warning: 'mcp' library not installed. MCP server disabled.")
    print("[MCP Server] Install with: pip install mcp>=1.0.0")

    def fetch_local_weather(location: str, crop: str) -> dict:
        """Stub implementation when MCP library is unavailable."""
        from tools.weather_tool import get_weather_context
        return get_weather_context(location, crop)
