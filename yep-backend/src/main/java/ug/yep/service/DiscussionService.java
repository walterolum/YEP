package ug.yep.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ug.yep.entity.DiscussionPost;
import ug.yep.entity.DiscussionThread;
import ug.yep.entity.User;
import ug.yep.exception.NotFoundException;
import ug.yep.repository.DiscussionPostRepository;
import ug.yep.repository.DiscussionThreadRepository;
import ug.yep.repository.UserRepository;

/** Level One discussion board. */
@Service
public class DiscussionService {

    private final DiscussionThreadRepository threads;
    private final DiscussionPostRepository posts;
    private final UserRepository users;

    public DiscussionService(DiscussionThreadRepository threads, DiscussionPostRepository posts,
                             UserRepository users) {
        this.threads = threads;
        this.posts = posts;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> threads() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (DiscussionThread thread : threads.findAllByOrderByCreatedAtDesc()) {
            list.add(view(thread));
        }
        return list;
    }

    @Transactional
    public Map<String, Object> startThread(Long userId, String title, String body) {
        User author = users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
        DiscussionThread thread = threads.save(new DiscussionThread(title.trim(), author));
        posts.save(new DiscussionPost(thread, author, body));
        return view(thread);
    }

    @Transactional
    public Map<String, Object> reply(Long threadId, Long userId, String body) {
        DiscussionThread thread = threads.findById(threadId)
                .orElseThrow(() -> new NotFoundException("Discussion"));
        User author = users.findById(userId).orElseThrow(() -> new NotFoundException("Account"));
        posts.save(new DiscussionPost(thread, author, body));
        return view(thread);
    }

    private Map<String, Object> view(DiscussionThread thread) {
        Map<String, Object> view = new LinkedHashMap<>();
        view.put("id", thread.getId());
        view.put("title", thread.getTitle());
        view.put("author", thread.getCreatedBy().getFullName());
        view.put("createdAt", thread.getCreatedAt().toString());
        List<Map<String, Object>> replies = new ArrayList<>();
        for (DiscussionPost post : posts.findByThreadIdOrderByCreatedAtAsc(thread.getId())) {
            Map<String, Object> reply = new LinkedHashMap<>();
            reply.put("id", post.getId());
            reply.put("author", post.getUser().getFullName());
            reply.put("body", post.getBody());
            reply.put("createdAt", post.getCreatedAt().toString());
            replies.add(reply);
        }
        view.put("posts", replies);
        return view;
    }
}
