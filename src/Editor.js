import React, { useState } from "react";
import { Editor, EditorState, Modifier, RichUtils, convertToRaw, convertFromRaw } from "draft-js";
import "draft-js/dist/Draft.css";

const MyEditor = () => {
    const [editorState, setEditorState] = useState(() => {
        const savedData = localStorage.getItem("draftEditorContent");
        return savedData
            ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedData)))
            : EditorState.createEmpty();
    });

    const handleEditorChange = (state) => {
        const content = state.getCurrentContent();
        const selection = state.getSelection();
        const blockKey = selection.getStartKey();
        const block = content.getBlockForKey(blockKey);
        const blockText = block.getText();
        const currentInlineStyles = state.getCurrentInlineStyle();

        const replaceTextAndToggleInlineStyle = (start, end, inlineStyle) => {
            let newEditorState = state;
            const selection = newEditorState.getSelection();
            const contentState = newEditorState.getCurrentContent();

            const newSelection = selection.merge({ anchorOffset: start, focusOffset: end });
            const newContent = Modifier.replaceText(contentState, newSelection, "");

            newEditorState = EditorState.push(newEditorState, newContent, "remove-range");

            const currentInlineStyles = newEditorState.getCurrentInlineStyle();
            currentInlineStyles.forEach((style) => {
                newEditorState = RichUtils.toggleInlineStyle(newEditorState, style);
            });

            if (!currentInlineStyles.has(inlineStyle)) {
                newEditorState = RichUtils.toggleInlineStyle(newEditorState, inlineStyle);
            } else {
                console.log(`Style "${inlineStyle}" is already applied and will not be toggled back on.`);
            }

            return newEditorState;
        };

        switch (true) {
            case blockText.startsWith("# ") && !blockText.startsWith("* ") && !blockText.startsWith("** ") && !blockText.startsWith("*** "): {
                const finalEditorState = replaceTextAndToggleInlineStyle(0, 2, 'HEADER');
                setEditorState(finalEditorState);
                break;
            }

            case blockText.endsWith(" #") && currentInlineStyles.has("HEADER"): {
                const finalEditorState = replaceTextAndToggleInlineStyle(blockText.length - 2, blockText.length, "HEADER");
                setEditorState(finalEditorState);
                break;
            }

            case blockText.startsWith("** ") && !blockText.startsWith("* ") && !blockText.startsWith("*** ") && !blockText.startsWith("# "): {
                const finalEditorState = replaceTextAndToggleInlineStyle(0, 3, 'RED_TEXT');
                setEditorState(finalEditorState);
                break;
            }

            case blockText.endsWith(" **") && currentInlineStyles.has("RED_TEXT"): {
                const finalEditorState = replaceTextAndToggleInlineStyle(blockText.length - 3, blockText.length, "RED_TEXT");
                setEditorState(finalEditorState);
                break;
            }

            case blockText.startsWith("* ") && !blockText.startsWith("** ") && !blockText.startsWith("*** ") && !blockText.startsWith("# "): {
                const finalEditorState = replaceTextAndToggleInlineStyle(0, 2, "BOLD");
                setEditorState(finalEditorState);
                break;
            }

            case blockText.endsWith(" *") && currentInlineStyles.has("BOLD"): {
                const finalEditorState = replaceTextAndToggleInlineStyle(blockText.length - 2, blockText.length, "BOLD");
                setEditorState(finalEditorState);
                break;
            }

            case blockText.startsWith("*** ") && !blockText.startsWith("* ") && !blockText.startsWith("** ") && !blockText.startsWith("# "): {
                const finalEditorState = replaceTextAndToggleInlineStyle(0, 4, 'UNDERLINE');
                setEditorState(finalEditorState);
                break;
            }

            case blockText.endsWith(" ***") && currentInlineStyles.has('UNDERLINE'): {
                const finalEditorState = replaceTextAndToggleInlineStyle(blockText.length - 4, blockText.length, 'UNDERLINE');
                setEditorState(finalEditorState);
                break;
            }

            default: {
                setEditorState(state);
                break;
            }
        }
    };

    const saveContent = () => {
        const content = editorState.getCurrentContent();
        const rawContent = convertToRaw(content);
        localStorage.setItem("draftEditorContent", JSON.stringify(rawContent));
        alert("Content saved!");
    };

    const customStyleMap = {
        'HEADER': {
            textDecoration: 'none',
            color: 'black',
            fontWeight: '700',
            fontSize: 32,
            lineHeight: '25px'
        },
        'RED_TEXT': {
            textDecoration: 'none',
            color: 'red',
            fontWeight: '400',
            lineHeight: '25px'
        },
        'UNDERLINE': {
            textDecoration: 'underline',
            color: 'black',
            fontWeight: '400',
            lineHeight: '25px'
        },
        'BOLD': {
            textDecoration: 'none',
            color: 'black',
            fontWeight: '700',
            lineHeight: '25px'
        }
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial" }}>
            <div style={{ position: "relative" }}>
                <h1 style={{ display: 'flex', justifyContent: 'center' }}>Demo editor by Zaheer</h1>
                <button onClick={saveContent} style={{ backgroundColor: 'skyblue', padding: "7px 20px", fontSize: "16px", position: 'absolute', top: 0, right: 0, borderRadius: 5, color: 'black' }}>
                    Save
                </button>
            </div>
            <div style={{ border: "2px solid skyblue", padding: "10px", minHeight: "500px", borderRadius: 10 }}>
                <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    placeholder="Type here..."
                    customStyleMap={customStyleMap}
                />
            </div>
        </div>
    );
}
export default MyEditor;
