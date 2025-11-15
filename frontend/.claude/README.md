# Claude Code Configuration for Calendar Frontend

This directory contains custom instructions and commands for Claude Code when working on the Calendar Application frontend.

## Custom Instructions

The `custom_instructions.md` file contains project-specific guidelines including:

- Project context and tech stack
- Coding preferences and standards
- Testing and verification requirements
- Communication guidelines
- Decision authority (what to do automatically vs ask first)
- Domain knowledge about the calendar application

## Slash Commands

Available commands in the `commands/` directory:

- `/build` - Build the application and report results
- `/test` - Run unit tests
- `/lint` - Run ESLint and report issues
- `/component [name]` - Generate a new Angular component
- `/service [name]` - Generate a new Angular service

## Usage

When working in this directory, Claude Code will automatically load the custom instructions and make the slash commands available.

Simply type `/` to see available commands.
