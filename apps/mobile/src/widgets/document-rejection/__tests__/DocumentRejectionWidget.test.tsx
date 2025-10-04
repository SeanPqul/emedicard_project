import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DocumentRejectionWidget } from '../DocumentRejectionWidget';
import { EnrichedRejection, RejectionCategory } from '@entities/document/model/rejection-types';
import { Id } from '@backend/convex/_generated/dataModel';

// Mock data for testing
const mockRejection: EnrichedRejection = {
  _id: 'test-rejection-id' as Id<"documentRejectionHistory">,
  applicationId: 'test-app-id' as Id<"applications">,
  documentTypeId: 'test-doc-type-id' as Id<"documentTypes">,
  documentTypeName: 'Valid ID',
  documentTypeIcon: 'card',
  rejectionCategory: RejectionCategory.QUALITY_ISSUE,
  rejectionReason: 'The uploaded image is too blurry to read the text clearly.',
  specificIssues: [
    'Image resolution is too low',
    'Text on the ID is not readable',
    'Photo appears to be taken from too far away'
  ],
  rejectedAt: Date.now(),
  rejectedByName: 'Admin John',
  attemptNumber: 1,
  wasReplaced: false,
  replacedAt: undefined,
  replacementInfo: null,
};

const mockRejectionReplaced: EnrichedRejection = {
  ...mockRejection,
  _id: 'test-rejection-replaced-id' as Id<"documentRejectionHistory">,
  wasReplaced: true,
  replacedAt: Date.now() - 3600000, // 1 hour ago
  replacementInfo: {
    uploadId: 'new-upload-id' as Id<"documentUploads">,
    fileName: 'valid-id-new.jpg',
    uploadedAt: Date.now() - 3600000,
    reviewStatus: 'Pending',
  },
};

describe('DocumentRejectionWidget', () => {
  const mockOnResubmit = jest.fn();
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders rejection information correctly', () => {
    const { getByText } = render(
      <DocumentRejectionWidget
        rejection={mockRejection}
        documentName="Valid ID"
        onResubmit={mockOnResubmit}
        onViewDetails={mockOnViewDetails}
      />
    );

    // Check header
    expect(getByText('Document Rejected')).toBeTruthy();
    expect(getByText('Valid ID')).toBeTruthy();
    expect(getByText('Attempt #1')).toBeTruthy();

    // Check rejection reason
    expect(getByText('The uploaded image is too blurry to read the text clearly.')).toBeTruthy();

    // Check specific issues
    expect(getByText('Issues to Address:')).toBeTruthy();
    expect(getByText('Image resolution is too low')).toBeTruthy();
    expect(getByText('Text on the ID is not readable')).toBeTruthy();
    expect(getByText('Photo appears to be taken from too far away')).toBeTruthy();

    // Check category badge
    expect(getByText('Quality Issue')).toBeTruthy();
  });

  it('renders loading state correctly', () => {
    const { queryByText } = render(
      <DocumentRejectionWidget
        rejection={mockRejection}
        documentName="Valid ID"
        onResubmit={mockOnResubmit}
        onViewDetails={mockOnViewDetails}
        isLoading={true}
      />
    );

    // When loading, the component should not show the document rejected text
    expect(queryByText('Document Rejected')).toBeNull();
  });

  it('calls onResubmit when resubmit button is pressed', () => {
    const { getByText } = render(
      <DocumentRejectionWidget
        rejection={mockRejection}
        documentName="Valid ID"
        onResubmit={mockOnResubmit}
        onViewDetails={mockOnViewDetails}
      />
    );

    const resubmitButton = getByText('Resubmit');
    fireEvent.press(resubmitButton);

    expect(mockOnResubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onViewDetails when details button is pressed', () => {
    const { getByText } = render(
      <DocumentRejectionWidget
        rejection={mockRejection}
        documentName="Valid ID"
        onResubmit={mockOnResubmit}
        onViewDetails={mockOnViewDetails}
      />
    );

    const detailsButton = getByText('Details');
    fireEvent.press(detailsButton);

    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('hides action buttons when showActions is false', () => {
    const { queryByText } = render(
      <DocumentRejectionWidget
        rejection={mockRejection}
        documentName="Valid ID"
        onResubmit={mockOnResubmit}
        onViewDetails={mockOnViewDetails}
        showActions={false}
      />
    );

    expect(queryByText('Resubmit')).toBeNull();
    expect(queryByText('Details')).toBeNull();
  });

  it('displays date correctly', () => {
    const testDate = new Date('2024-10-04T12:00:00Z');
    const rejection = {
      ...mockRejection,
      rejectedAt: testDate.getTime(),
    };

    const { getByText } = render(
      <DocumentRejectionWidget
        rejection={rejection}
        documentName="Valid ID"
        onResubmit={mockOnResubmit}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(getByText(/Oct 4, 2024/)).toBeTruthy();
  });

  it('handles different rejection categories correctly', () => {
    const categoryTests = [
      { category: RejectionCategory.WRONG_DOCUMENT, label: 'Wrong Document' },
      { category: RejectionCategory.EXPIRED_DOCUMENT, label: 'Expired Document' },
      { category: RejectionCategory.INCOMPLETE_DOCUMENT, label: 'Incomplete Document' },
    ];

    categoryTests.forEach(({ category, label }) => {
      const { getByText, unmount } = render(
        <DocumentRejectionWidget
          rejection={{ ...mockRejection, rejectionCategory: category }}
          documentName="Test Document"
          onResubmit={mockOnResubmit}
          onViewDetails={mockOnViewDetails}
        />
      );

      expect(getByText(label)).toBeTruthy();
      unmount();
    });
  });

  it('renders correctly when rejection has been replaced', () => {
    const { getByText, queryByText } = render(
      <DocumentRejectionWidget
        rejection={mockRejectionReplaced}
        documentName="Valid ID"
        onResubmit={mockOnResubmit}
        onViewDetails={mockOnViewDetails}
      />
    );

    // Should still show rejection info
    expect(getByText('Document Rejected')).toBeTruthy();
    
    // But action buttons should still be visible (widget doesn't check wasReplaced)
    expect(getByText('Resubmit')).toBeTruthy();
  });
});
