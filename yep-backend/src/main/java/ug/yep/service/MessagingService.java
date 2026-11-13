package ug.yep.service;

import java.util.List;
import ug.yep.dto.Requests;
import ug.yep.dto.Views;
import ug.yep.security.CurrentUser;

/** Threaded messaging with visibility and reply rules per thread kind. */
public interface MessagingService {

    List<Views.ThreadView> threads(Long userId);

    Views.ThreadView thread(Long threadId, Long userId);

    Views.ThreadView create(CurrentUser actor, Requests.NewThreadRequest request);

    Views.ThreadView post(Long threadId, Long userId, String body);

    boolean canReply(ug.yep.entity.MessageThread thread, Long userId);
}
