import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalDescription,
  ModalHeader,
  ModalFooter,
} from "@/components/ui/modal";

describe("ModalContent", () => {
  it("renders children inside ModalContent", () => {
    render(
      <Modal open={true}>
        <ModalContent>
          <span>Modal body</span>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("renders close button with aria-label Закрыть by default", () => {
    render(
      <Modal open={true}>
        <ModalContent>content</ModalContent>
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeInTheDocument();
  });

  it("hideCloseButton prop removes the close button", () => {
    render(
      <Modal open={true}>
        <ModalContent hideCloseButton>content</ModalContent>
      </Modal>,
    );
    expect(screen.queryByRole("button", { name: "Закрыть" })).not.toBeInTheDocument();
  });
});

describe("ModalTitle", () => {
  it("renders its text", () => {
    render(
      <Modal open={true}>
        <ModalContent>
          <ModalTitle>My Title</ModalTitle>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });
});

describe("ModalDescription", () => {
  it("renders its text", () => {
    render(
      <Modal open={true}>
        <ModalContent>
          <ModalTitle>t</ModalTitle>
          <ModalDescription>My Description</ModalDescription>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByText("My Description")).toBeInTheDocument();
  });
});

describe("ModalHeader", () => {
  it("renders children", () => {
    render(
      <Modal open={true}>
        <ModalContent>
          <ModalHeader>
            <span>Header child</span>
          </ModalHeader>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByText("Header child")).toBeInTheDocument();
  });
});

describe("ModalFooter", () => {
  it("renders children", () => {
    render(
      <Modal open={true}>
        <ModalContent>
          <ModalTitle>t</ModalTitle>
          <ModalFooter>
            <button>Footer btn</button>
          </ModalFooter>
        </ModalContent>
      </Modal>,
    );
    expect(screen.getByText("Footer btn")).toBeInTheDocument();
  });
});
