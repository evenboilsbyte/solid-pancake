const imageInput = document.getElementById("imageInput");
const fileName = document.getElementById("fileName");
const previewArea = document.getElementById("previewArea");

// UI placeholders for AI output and prompt template
let descriptionArea = document.getElementById("aiDescription");
let promptArea = document.getElementById("promptTemplateDisplay");
if (!descriptionArea) {
  descriptionArea = document.createElement("div");
  descriptionArea.id = "aiDescription";
  descriptionArea.style.marginTop = "12px";
  previewArea.insertAdjacentElement('afterend', descriptionArea);
}
if (!promptArea) {
  promptArea = document.createElement("pre");
  promptArea.id = "promptTemplateDisplay";
  promptArea.style.marginTop = "8px";
  promptArea.style.whiteSpace = "pre-wrap";
  descriptionArea.insertAdjacentElement('afterend', promptArea);
}

// Prompt template the AI should use to describe images
const PROMPT_TEMPLATE = `You are an image description assistant. For the provided image, return the following sections in clear, labeled blocks:

- One-line caption: a concise, descriptive caption (6-12 words).
- Detailed description: comprehensive visual details (objects, people, clothing, colors, positions, background, textures, lighting, perspective).
- Observable actions/pose: what subjects are doing or how they are posed.
- Emotions/mood: inferred mood or atmosphere from facial expressions, color, lighting.
- Text found in image: transcribe any visible text exactly as it appears.
- Suggested tags/keywords: 8-12 short keywords useful for search or alt text.
- Safety note: mention if the image contains any potentially sensitive, explicit, or personally identifiable content.

Do NOT guess private information (names, ages) or make unverifiable claims. Be neutral and factual. Keep language concise and avoid speculation.`;

// Show prompt template in UI
promptArea.textContent = PROMPT_TEMPLATE;

imageInput.addEventListener("change", async () => {
  const file = imageInput.files?.[0];
  if (!file) {
    fileName.textContent = "No file";
    previewArea.innerHTML = "<span>No image selected yet. Use the upload bar below.</span>";
    descriptionArea.textContent = "";
    return;
  }

  fileName.textContent = file.name;

  const img = document.createElement("img");
  img.style.maxWidth = "100%";
  img.style.maxHeight = "100%";
  img.style.objectFit = "contain";
  img.alt = "Uploaded image preview";

  const reader = new FileReader();
  reader.onload = e => {
    img.src = e.target?.result;
    previewArea.innerHTML = "";
    previewArea.appendChild(img);
  };
  reader.readAsDataURL(file);

  // Send the image to the AI backend to get a description.
  // This example posts to an application endpoint at `/api/describe-image`.
  // You should implement that endpoint server-side to call the AI provider (OpenAI, etc.)
  try {
    descriptionArea.textContent = "Describing image...";

    const form = new FormData();
    form.append('image', file);
    form.append('promptTemplate', PROMPT_TEMPLATE);

    const res = await fetch('/api/describe-image', {
      method: 'POST',
      body: form
    });

    if (!res.ok) {
      const text = await res.text();
      descriptionArea.textContent = `Server error: ${res.status} ${text}`;
      return;
    }

    const data = await res.json();
    // Expecting `{ description: '...', promptUsed: '...' }` from server
    descriptionArea.textContent = data.description || 'No description returned.';
    if (data.promptUsed) promptArea.textContent = data.promptUsed;
  } catch (err) {
    descriptionArea.textContent = `Request failed: ${err}`;
  }
});

/*
Server-side notes (example): implement POST /api/describe-image to accept multipart/form-data.
The server should:
- Receive the uploaded file and the promptTemplate string.
- Call your AI provider (e.g., OpenAI Responses API) with the image as an attachment
  and the provided prompt template as the system/user prompt.
- Return JSON: { description: '<ai output>', promptUsed: '<the prompt string>' }

Do NOT put API keys in client-side code. Keep them on the server.
*/

export { PROMPT_TEMPLATE };
