export async function GET() {
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>AeroMind REST API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        margin: 0;
        background-color: #0d0e12;
      }
    </style>
  </head>
  <body>
    <!-- Scalar configuration -->
    <script
      id="api-reference"
      data-url="/api/openapi.json"
    ></script>
    <!-- Scalar Script -->
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
  `.trim();

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
