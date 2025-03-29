
import React from 'react';
import { Button } from '@/components/ui/button';

interface Comment {
  left: number;
  top: number;
  text: string;
}

interface CommentOverlayProps {
  comments: Array<Comment>;
  commentPosition: { left: number; top: number } | null;
  commentText: string;
  setCommentText: (text: string) => void;
  addComment: () => void;
  cancelComment: () => void;
}

const CommentOverlay: React.FC<CommentOverlayProps> = ({
  comments,
  commentPosition,
  commentText,
  setCommentText,
  addComment,
  cancelComment
}) => {
  return (
    <>
      {comments.map((comment, index) => (
        <div
          key={`comment-overlay-${index}`}
          className="absolute bg-yellow-100 p-2 rounded shadow-md text-sm"
          style={{
            left: `${comment.left}px`,
            top: `${comment.top}px`
          }}
        >
          {comment.text}
        </div>
      ))}
      
      {commentPosition && (
        <div 
          className="absolute bg-white p-4 rounded shadow-md z-10 border border-gray-300"
          style={{ 
            left: `${commentPosition.left}px`, 
            top: `${commentPosition.top + 20}px`,
            minWidth: '250px'
          }}
        >
          <textarea
            className="w-full p-2 border rounded mb-2"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add your comment here..."
            rows={3}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={cancelComment}>Cancel</Button>
            <Button size="sm" onClick={addComment}>Add Comment</Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentOverlay;
