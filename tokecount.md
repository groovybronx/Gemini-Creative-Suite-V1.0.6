Python JavaScript Go

<br />

Gemini and other generative AI models process input and output at a granularity
called a *token*.

## About tokens

Tokens can be single characters like `z` or whole words like `cat`. Long words
are broken up into several tokens. The set of all tokens used by the model is
called the vocabulary, and the process of splitting text into tokens is called
*tokenization*.

For Gemini models, a token is equivalent to about 4 characters.
100 tokens is equal to about 60-80 English words.

When billing is enabled, the [cost of a call to the Gemini API](https://ai.google.dev/pricing) is
determined in part by the number of input and output tokens, so knowing how to
count tokens can be helpful.

## Try out counting tokens in a Colab

You can try out counting tokens by using a Colab.

|---------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [![](https://ai.google.dev/static/site-assets/images/docs/notebook-site-button.png)View on ai.google.dev](https://ai.google.dev/gemini-api/docs/tokens) | [![](https://www.tensorflow.org/images/colab_logo_32px.png)Try a Colab notebook](https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Counting_Tokens.ipynb) | [![](https://www.tensorflow.org/images/GitHub-Mark-32px.png)View notebook on GitHub](https://colab.research.google.com/github/google-gemini/cookbook/blob/main/quickstarts/Counting_Tokens.ipynb) |

## Context windows

The models available through the Gemini API have context windows that are
measured in tokens. The context window defines how much input you can provide
and how much output the model can generate. You can determine the size of the
context window by calling the [getModels endpoint](https://ai.google.dev/api/rest/v1/models/get) or
by looking in the [models documentation](https://ai.google.dev/gemini-api/docs/models/gemini).

In the following example, you can see that the `gemini-1.5-flash` model has an
input limit of about 1,000,000 tokens and an output limit of about 8,000 tokens,
which means a context window is 1,000,000 tokens.

<br />

    from google import genai

    client = genai.Client()
    model_info = client.models.get(model="gemini-2.0-flash")
    print(f"{model_info.input_token_limit=}")
    print(f"{model_info.output_token_limit=}")
    # ( e.g., input_token_limit=30720, output_token_limit=2048 )  
    https://github.com/google-gemini/api-examples/blob/9f5adb78a77820ef2d4f2a040d698481803e8214/python/count_tokens.py#L25-L31

## Count tokens

All input to and output from the Gemini API is tokenized, including text, image
files, and other non-text modalities.

You can count tokens in the following ways:

### Count text tokens

    from google import genai

    client = genai.Client()
    prompt = "The quick brown fox jumps over the lazy dog."

    # Count tokens using the new client method.
    total_tokens = client.models.count_tokens(
        model="gemini-2.0-flash", contents=prompt
    )
    print("total_tokens: ", total_tokens)
    # ( e.g., total_tokens: 10 )

    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )

    # The usage_metadata provides detailed token counts.
    print(response.usage_metadata)
    # ( e.g., prompt_token_count: 11, candidates_token_count: 73, total_token_count: 84 )  
    https://github.com/google-gemini/api-examples/blob/9f5adb78a77820ef2d4f2a040d698481803e8214/python/count_tokens.py#L36-L54

### Count multi-turn (chat) tokens

    from google import genai
    from google.genai import types

    client = genai.Client()

    chat = client.chats.create(
        model="gemini-2.0-flash",
        history=[
            types.Content(
                role="user", parts=[types.Part(text="Hi my name is Bob")]
            ),
            types.Content(role="model", parts=[types.Part(text="Hi Bob!")]),
        ],
    )
    # Count tokens for the chat history.
    print(
        client.models.count_tokens(
            model="gemini-2.0-flash", contents=chat.get_history()
        )
    )
    # ( e.g., total_tokens: 10 )

    response = chat.send_message(
        message="In one sentence, explain how a computer works to a young child."
    )
    print(response.usage_metadata)
    # ( e.g., prompt_token_count: 25, candidates_token_count: 21, total_token_count: 46 )

    # You can count tokens for the combined history and a new message.
    extra = types.UserContent(
        parts=[
            types.Part(
                text="What is the meaning of life?",
            )
        ]
    )
    history = chat.get_history()
    history.append(extra)
    print(client.models.count_tokens(model="gemini-2.0-flash", contents=history))
    # ( e.g., total_tokens: 56 )  
    https://github.com/google-gemini/api-examples/blob/9f5adb78a77820ef2d4f2a040d698481803e8214/python/count_tokens.py#L59-L98

### Count multimodal tokens

All input to the Gemini API is tokenized, including text, image files, and other
non-text modalities. Note the following high-level key points about tokenization
of multimodal input during processing by the Gemini API:

- With Gemini 2.0, image inputs with both dimensions \<=384 pixels are counted as
  258 tokens. Images larger in one or both dimensions are cropped and scaled as
  needed into tiles of 768x768 pixels, each counted as 258 tokens. Prior to Gemini
  2.0, images used a fixed 258 tokens.

- Video and audio files are converted to tokens at the following fixed rates:
  video at 263 tokens per second and audio at 32 tokens per second.

#### Image files

| **Note:** You'll get the same token count if you use a file uploaded using the File API or you provide the file as inline data.

Example that uses an uploaded image from the File API:  

    from google import genai

    client = genai.Client()
    prompt = "Tell me about this image"
    your_image_file = client.files.upload(file=media / "organ.jpg")

    print(
        client.models.count_tokens(
            model="gemini-2.0-flash", contents=[prompt, your_image_file]
        )
    )
    # ( e.g., total_tokens: 263 )

    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=[prompt, your_image_file]
    )
    print(response.usage_metadata)
    # ( e.g., prompt_token_count: 264, candidates_token_count: 80, total_token_count: 345 )  
    https://github.com/google-gemini/api-examples/blob/9f5adb78a77820ef2d4f2a040d698481803e8214/python/count_tokens.py#L127-L144

Example that provides the image as inline data:  

    from google import genai
    import PIL.Image

    client = genai.Client()
    prompt = "Tell me about this image"
    your_image_file = PIL.Image.open(media / "organ.jpg")

    # Count tokens for combined text and inline image.
    print(
        client.models.count_tokens(
            model="gemini-2.0-flash", contents=[prompt, your_image_file]
        )
    )
    # ( e.g., total_tokens: 263 )

    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=[prompt, your_image_file]
    )
    print(response.usage_metadata)
    # ( e.g., prompt_token_count: 264, candidates_token_count: 80, total_token_count: 345 )  
    https://github.com/google-gemini/api-examples/blob/9f5adb78a77820ef2d4f2a040d698481803e8214/python/count_tokens.py#L103-L122

#### Video or audio files

Audio and video are each converted to tokens at the following fixed rates:

- Video: 263 tokens per second
- Audio: 32 tokens per second

**Note:** You'll get the same token count if you use a file uploaded using the File API or you provide the file as inline data.  

    from google import genai
    import time

    client = genai.Client()
    prompt = "Tell me about this video"
    your_file = client.files.upload(file=media / "Big_Buck_Bunny.mp4")

    # Poll until the video file is completely processed (state becomes ACTIVE).
    while not your_file.state or your_file.state.name != "ACTIVE":
        print("Processing video...")
        print("File state:", your_file.state)
        time.sleep(5)
        your_file = client.files.get(name=your_file.name)

    print(
        client.models.count_tokens(
            model="gemini-2.0-flash", contents=[prompt, your_file]
        )
    )
    # ( e.g., total_tokens: 300 )

    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=[prompt, your_file]
    )
    print(response.usage_metadata)
    # ( e.g., prompt_token_count: 301, candidates_token_count: 60, total_token_count: 361 )  
    https://github.com/google-gemini/api-examples/blob/9f5adb78a77820ef2d4f2a040d698481803e8214/python/count_tokens.py#L149-L174

### System instructions and tools

System instructions and tools also count towards the total token count for the
input.

If you use system instructions, the `total_tokens` count increases to
reflect the addition of `system_instruction`.

If you use function calling, the `total_tokens` count increases to reflect the
addition of `tools`.